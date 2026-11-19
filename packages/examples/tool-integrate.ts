/**
 * This is an example showing how to accept Standard Tools in a generic way.
 * It describes tools to a model, validates the arguments of the tools it calls,
 * runs them, and reports the results back to it.
 */

import type { StandardSchemaV1, StandardToolV1 } from "@standard-schema/spec";

// A model provider's tool definition.
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

// Describing a tool doesn't run it, so it can need any context. `never`
// accepts every tool, and since no value is a `never`, none can be run by
// mistake.
type AnyContextTool = StandardToolV1<any, unknown, never>;

// Tools are registered by key, which names the ones without a name of their
// own, since providers require one.
function toolName(key: string, tool: AnyContextTool): string {
  return tool["~standard"].name || key;
}

export function describeTools(
  tools: Readonly<Record<string, AnyContextTool>>,
): ToolDefinition[] {
  const names = new Set<string>();
  return Object.entries(tools).map(([key, tool]) => {
    const name = toolName(key, tool);
    // the model calls tools by name, so a duplicate could never be called
    if (names.has(name)) throw new Error(`Duplicate tool name: ${name}`);
    names.add(name);
    const input_schema = tool["~standard"].input["~standard"].jsonSchema.input({
      target: "draft-2020-12",
    });
    // providers require a top-level `type: "object"`, so reject other tools
    // up front
    if (input_schema.type !== "object") {
      throw new Error(
        `Tool ${name}'s input JSON Schema must have type "object"`,
      );
    }
    return { name, description: tool["~standard"].description, input_schema };
  });
}

// What the model reads for a failure: the library's own summary if it has
// one, otherwise each issue's message after its path.
function failureContent(failure: StandardSchemaV1.FailureResult): string {
  return (
    failure.message ??
    failure.issues
      .map(({ message, path }) => {
        const keys = path?.map((segment) =>
          String(typeof segment === "object" ? segment.key : segment),
        );
        return keys?.length ? `${keys.join(".")}: ${message}` : message;
      })
      .join("\n")
  );
}

// Run the tool the model called, and report the outcome back to it. A
// framework passes each tool the context it provides, like the current
// request; a tool that needs more than that is a type error in `tools`. A
// model's arguments may not match a tool's input, and tools don't validate, so
// it accepts only tools whose input schema can validate them.
export async function runToolCall<Context>(
  tools: Readonly<
    // `NoInfer`, so `Context` comes from the context passed below
    Record<string, StandardToolV1.Validatable<any, unknown, NoInfer<Context>>>
  >,
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
  const tool = Object.entries(tools).find(
    ([key, tool]) => toolName(key, tool) === call.name,
  )?.[1];
  if (!tool) return failure(`Unknown tool: ${call.name}`);

  let input: StandardSchemaV1.Result<unknown>;
  try {
    input = await tool["~standard"].input["~standard"].validate(call.input);
  } catch (error) {
    // a schema that throws, like a failed transform, is unexpected too
    console.error(error);
    return failure("The tool's arguments couldn't be validated");
  }
  // the tool didn't run, so report the issues and let the model try again
  if (input.issues) {
    return failure(
      `Invalid arguments, so the tool didn't run:\n${failureContent(input)}`,
    );
  }

  let output: StandardSchemaV1.Result<unknown>;
  try {
    output = await tool["~standard"].execute(input.value, {
      signal,
      callId: call.id,
      context,
    });
  } catch (error) {
    // a rejection is unexpected and may contain internal details, so this
    // framework logs it rather than showing it to the model. Showing its
    // message instead is a framework's choice
    console.error(error);
    return failure("The tool failed unexpectedly");
  }
  // a returned failure is one the tool chose to tell its caller
  if (output.issues) return failure(failureContent(output));

  let content: string;
  try {
    // an undefined output serializes to undefined
    content = JSON.stringify(output.value) ?? "";
  } catch {
    // like a BigInt or a circular reference
    return failure("The tool's output couldn't be serialized");
  }
  return { tool_use_id: call.id, content, is_error: false };
}
