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

// Describing a tool doesn't run it, so it can need any context. Context is
// passed into a tool, so `never`, not `any`, is the context every tool accepts.
type AnyContextTool = StandardToolV1<any, unknown, never>;

// Providers require a non-empty name, so name anonymous tools by position.
function toolName(tool: AnyContextTool, index: number): string {
  return tool["~standard"].name || `tool_${index}`;
}

// Tools throw for a target they don't support, so fall back to the other
// widely supported one.
function inputSchema(tool: AnyContextTool): Record<string, unknown> {
  try {
    return tool["~standard"].jsonSchema.input({ target: "draft-2020-12" });
  } catch {
    return tool["~standard"].jsonSchema.input({ target: "draft-07" });
  }
}

// Describe each tool to the model.
export function describeTools(
  tools: ReadonlyArray<AnyContextTool>,
): ToolDefinition[] {
  const names = new Set<string>();
  return tools.map((tool, i) => {
    const name = toolName(tool, i);
    // the model calls tools by name, so a duplicate could never be called
    if (names.has(name)) throw new Error(`Duplicate tool name: ${name}`);
    names.add(name);
    return {
      name,
      description: tool["~standard"].description,
      input_schema: inputSchema(tool),
    };
  });
}

// Run the tool the model called, and report the outcome back to it. A
// framework passes each tool the context it provides, like the current
// request; a tool that needs more than that is a type error in `tools`.
export async function runToolCall<Context>(
  tools: ReadonlyArray<StandardToolV1<any, unknown, Context>>,
  call: ToolCall,
  context: Context,
  // e.g. aborted when the user stops the conversation
  signal?: AbortSignal,
): Promise<ToolResult> {
  // find the tool by the name it was described with
  const tool = tools.find((tool, i) => toolName(tool, i) === call.name);
  if (!tool) {
    return {
      tool_use_id: call.id,
      content: `Unknown tool: ${call.name}`,
      is_error: true,
    };
  }

  let output: unknown;
  try {
    // the tool validates the model's arguments itself, so pass them as-is
    output = await tool["~standard"].execute(call.input, {
      signal,
      callId: call.id,
      context,
    });
  } catch (error) {
    // report the error, like invalid arguments, so the model can try again
    return {
      tool_use_id: call.id,
      content: error instanceof Error ? error.message : String(error),
      is_error: true,
    };
  }

  // the tool has already run, so an output that can't be serialized is a bug
  // to surface, not an error the model should retry
  return {
    tool_use_id: call.id,
    // an undefined output serializes to undefined
    content: JSON.stringify(output) ?? "",
    is_error: false,
  };
}

// Run a tool directly, with its input, output and context types inferred.
export async function callTool<Input, Output, Context>(
  tool: StandardToolV1<Input, Output, Context>,
  input: Input,
  context: Context,
): Promise<Output> {
  return tool["~standard"].execute(input, { context });
}
