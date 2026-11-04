/**
 * This example shows how an AI library accepts Standard Tools. It describes
 * the tools to a model, executes the tools the model calls and reports the
 * results back to it. The tools don't validate anything themselves, so the
 * library validates the input of the model with the input schema before
 * calling `execute`, and its output with the output schema afterwards.
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

// A tool with any input and output. The input is `any`, because each tool
// expects a different input. It is validated with the input schema of the
// tool before it is passed to `execute`.
// biome-ignore lint/suspicious/noExplicitAny: accepts tools of any input
type AnyTool<Context> = StandardToolV1<any, unknown, Context>;

// Describe each tool to the model, keyed by the name the model calls it with.
export function describeTools(
  tools: Record<string, AnyTool<never>>,
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
  tools: Record<string, AnyTool<Context>>,
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

  const { input, output } = tool["~standard"];

  // validate the input of the model, since it can't be trusted
  let validInput: unknown = call.input;
  if (input) {
    const result = await input["~standard"].validate(call.input);
    if (result.issues) {
      // don't run the tool and let the model correct its input
      return {
        tool_use_id: call.id,
        content: `Invalid input, fix it and try again: ${JSON.stringify(result.issues)}`,
        is_error: true,
      };
    }
    // the output of the input schema is the input of `execute`
    validInput = result.value;
  }

  let value: unknown;
  try {
    value = await tool["~standard"].execute(validInput, {
      signal,
      callId: call.id,
      context,
    });
  } catch (error) {
    // the tool itself failed
    return {
      tool_use_id: call.id,
      content: error instanceof Error ? error.message : String(error),
      is_error: true,
    };
  }

  // validate the output of `execute`, which is the input of the output schema
  if (output) {
    const result = await output["~standard"].validate(value);
    if (result.issues) {
      // the tool already ran, so it should not simply be retried
      return {
        tool_use_id: call.id,
        content: "The tool returned an invalid output",
        is_error: true,
      };
    }
    value = result.value;
  }

  return {
    tool_use_id: call.id,
    content: JSON.stringify(value) ?? "",
    is_error: false,
  };
}
