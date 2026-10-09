/**
 * This is an example showing how to accept Standard Tools in a generic way.
 * It describes tools to a model, runs the tools it calls, and reports the
 * results back to it.
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

// Describe each tool to the model.
export function describeTools(
  tools: ReadonlyArray<StandardToolV1>,
): ToolDefinition[] {
  return tools.map((tool, i) => ({
    // providers require a non-empty name, so name anonymous tools
    name: tool["~standard"].name || `tool_${i}`,
    description: tool["~standard"].description,
    input_schema: tool["~standard"].jsonSchema.input({
      target: "draft-2020-12",
    }),
  }));
}

// Run the tool the model called, and report the outcome back to it. A framework passes each tool the context it
// provides, like the current request; a tool that needs more than that is a type error in `tools`.
export async function runToolCall<Context>(
  tools: ReadonlyArray<StandardToolV1<any, unknown, Context>>,
  call: ToolCall,
  context: Context,
  // e.g. aborted when the user stops the conversation
  signal?: AbortSignal,
): Promise<ToolResult> {
  const tool = tools.find((tool) => tool["~standard"].name === call.name);
  if (!tool) {
    return {
      tool_use_id: call.id,
      content: `Unknown tool: ${call.name}`,
      is_error: true,
    };
  }

  try {
    // the tool validates the model's arguments itself, so pass them as-is
    const output = await tool["~standard"].execute(call.input, {
      signal,
      context,
    });
    return {
      tool_use_id: call.id,
      content: JSON.stringify(output),
      is_error: false,
    };
  } catch (error) {
    // report the error, like invalid arguments, so the model can try again
    return {
      tool_use_id: call.id,
      content: error instanceof Error ? error.message : String(error),
      is_error: true,
    };
  }
}

// Run a tool directly, with its input, output and context types inferred.
export async function callTool<T extends StandardToolV1<any, unknown, any>>(
  tool: T,
  input: StandardToolV1.InferInput<T>,
  context: StandardToolV1.InferContext<T>,
): Promise<StandardToolV1.InferOutput<T>> {
  return tool["~standard"].execute(input, { context });
}
