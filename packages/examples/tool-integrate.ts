/**
 * This is an example showing how to accept Standard Tools in a generic way.
 * It describes tools to a model, validates the arguments of the tools it calls,
 * runs them, and reports the results back to it.
 */

import type { StandardSchemaV1, StandardToolV1 } from "@standard-schema/spec";

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

// A model's arguments may not match a tool's input, and tools don't validate,
// so this framework accepts tools whose input schema can validate them.
type ValidatedTool<Context> = StandardToolV1<any, unknown, Context> & {
  readonly "~standard": { readonly input: StandardSchemaV1<unknown, any> };
};

// Providers require a non-empty name, so name anonymous tools by position.
function toolName(tool: AnyContextTool, index: number): string {
  return tool["~standard"].name || `tool_${index}`;
}

// Tools throw for a target they don't support, so fall back to the other
// widely supported one.
function inputSchema(tool: AnyContextTool): Record<string, unknown> {
  const { jsonSchema } = tool["~standard"].input["~standard"];
  try {
    return jsonSchema.input({ target: "draft-2020-12" });
  } catch {
    return jsonSchema.input({ target: "draft-07" });
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

// What the model reads for a failure, preferring the library's own summary.
function failureContent(failure: StandardSchemaV1.FailureResult): string {
  return failure.message ?? JSON.stringify(failure.issues);
}

// Run the tool the model called, and report the outcome back to it. A
// framework passes each tool the context it provides, like the current
// request; a tool that needs more than that is a type error in `tools`.
export async function runToolCall<Context>(
  tools: ReadonlyArray<ValidatedTool<Context>>,
  call: ToolCall,
  context: Context,
  // e.g. aborted when the user stops the conversation
  signal?: AbortSignal,
): Promise<ToolResult> {
  const failure = (content: string): ToolResult => ({
    tool_use_id: call.id,
    content,
    is_error: true,
  });

  // find the tool by the name it was described with
  const tool = tools.find((tool, i) => toolName(tool, i) === call.name);
  if (!tool) return failure(`Unknown tool: ${call.name}`);

  // the tool didn't run, so report the issues and let the model try again
  const input = await tool["~standard"].input["~standard"].validate(call.input);
  if (input.issues) return failure(failureContent(input));

  let output: StandardSchemaV1.Result<unknown>;
  try {
    output = await tool["~standard"].execute(input.value, {
      signal,
      callId: call.id,
      context,
    });
  } catch {
    // a rejection is unexpected and may contain internal details, so log it
    // on your side rather than showing it to the model
    return failure("The tool failed unexpectedly");
  }
  // a returned failure is one the tool chose to tell its caller
  if (output.issues) return failure(failureContent(output));

  // the tool has already run, so an output that can't be serialized is a bug
  // to surface, not an error the model should retry
  return {
    tool_use_id: call.id,
    // an undefined output serializes to undefined
    content: JSON.stringify(output.value) ?? "",
    is_error: false,
  };
}

// Run a tool directly with input known to match, with its input, output and
// context types inferred.
export async function callTool<Input, Output, Context>(
  tool: StandardToolV1<Input, Output, Context>,
  input: Input,
  context: Context,
): Promise<StandardSchemaV1.Result<Output>> {
  return tool["~standard"].execute(input, { context });
}
