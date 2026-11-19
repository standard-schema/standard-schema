/**
 * This example shows how an AI library accepts Standard Tools. It describes
 * the tools to a model, executes the tools the model calls and reports the
 * results back to it. The tools validate their own input and output, so the
 * library passes the raw input of the model to `execute`.
 */

import type { StandardToolV1 } from "@standard-schema/spec";

// The shape most model providers accept for a tool definition.
interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

// A tool call made by the model, and the result sent back to it.
interface ToolCall {
  id: string;
  name: string;
  input: unknown;
}

interface ToolResult {
  tool_use_id: string;
  content: string;
  is_error: boolean;
}

// Describe each tool to the model, keyed by the name the model calls it with.
export function describeTools(
  tools: Record<string, StandardToolV1<unknown, unknown, never>>,
): ToolDefinition[] {
  return Object.entries(tools).map(([name, tool]) => {
    const { input, description } = tool["~standard"];
    return {
      name,
      description: description ?? "",
      input_schema: input
        ? input["~standard"].jsonSchema.input({ target: "draft-07" })
        : { type: "object", properties: {} },
    };
  });
}

// Execute the tool the model called. A tool that needs more context than the
// library provides is a type error in `tools`.
export async function executeToolCall<Context>(
  tools: Record<string, StandardToolV1<unknown, unknown, Context>>,
  call: ToolCall,
  context: Context,
  signal?: AbortSignal,
): Promise<ToolResult> {
  const tool = tools[call.name];
  if (!tool) {
    return {
      tool_use_id: call.id,
      content: `Unknown tool: ${call.name}`,
      is_error: true,
    };
  }

  try {
    // pass the raw input, the tool validates it
    const result = await tool["~standard"].execute(call.input, {
      signal,
      callId: call.id,
      context,
    });

    if (result.issues) {
      return {
        tool_use_id: call.id,
        content:
          result.source === "input"
            ? // the tool did not run, so the model can correct its input
              `Invalid input, fix it and try again: ${JSON.stringify(result.issues)}`
            : // the tool ran, but returned an invalid output
              "The tool returned an invalid output",
        is_error: true,
      };
    }

    return {
      tool_use_id: call.id,
      content: JSON.stringify(result.value) ?? "",
      is_error: false,
    };
  } catch (error) {
    // the tool itself failed
    return {
      tool_use_id: call.id,
      content: error instanceof Error ? error.message : String(error),
      is_error: true,
    };
  }
}
