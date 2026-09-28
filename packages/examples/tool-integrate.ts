/**
 * This is an example showing how to accept Standard Tools in a generic way.
 * It describes tools to a model, validates the arguments the model produces,
 * and runs the tools it calls.
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

// Describe each tool to the model.
export function describeTools(
  tools: ReadonlyArray<StandardToolV1>,
): ToolDefinition[] {
  return tools.map((tool) => {
    const inputSchema = tool["~standard"].inputSchema;
    return {
      name: tool["~standard"].name,
      description: tool["~standard"].description,
      // a tool without an input schema takes no arguments
      input_schema: inputSchema
        ? inputSchema["~standard"].jsonSchema.input({ target: "draft-2020-12" })
        : { type: "object", properties: {} },
    };
  });
}

// Validate the input, run the tool, and validate its output.
async function executeTool(
  tool: StandardToolV1,
  input: unknown,
): Promise<StandardSchemaV1.Result<unknown>> {
  // a tool without an input schema gets the model's arguments as-is, just as
  // one without an output schema returns its result as-is
  let value = input;

  const inputSchema = tool["~standard"].inputSchema;
  if (inputSchema) {
    // model-produced input is untrusted, so validate it before running the tool
    let parsed = inputSchema["~standard"].validate(input);
    if (parsed instanceof Promise) parsed = await parsed;

    // if the `issues` field exists, the input was invalid, so don't run the tool
    if (parsed.issues) return parsed;

    value = parsed.value;
  }

  let output = tool["~standard"].execute(value);
  if (output instanceof Promise) output = await output;

  const outputSchema = tool["~standard"].outputSchema;
  if (!outputSchema) return { value: output };

  let result = outputSchema["~standard"].validate(output);
  if (result instanceof Promise) result = await result;

  // unlike invalid input, an invalid output is a bug in the tool, so the
  // model can't correct it
  if (result.issues) {
    throw new Error(
      `Invalid output from ${tool["~standard"].name}: ${JSON.stringify(result.issues)}`,
    );
  }

  return result;
}

// Run the tool the model called, and report the outcome back to it.
export async function runToolCall(
  tools: ReadonlyArray<StandardToolV1>,
  call: ToolCall,
): Promise<ToolResult> {
  const tool = tools.find((tool) => tool["~standard"].name === call.name);
  if (!tool) {
    return {
      tool_use_id: call.id,
      content: `Unknown tool: ${call.name}`,
      is_error: true,
    };
  }

  const result = await executeTool(tool, call.input);

  // if the `issues` field exists, the input was invalid, so the model can
  // correct its arguments and try again
  if (result.issues) {
    return {
      tool_use_id: call.id,
      content: JSON.stringify(result.issues),
      is_error: true,
    };
  }

  return {
    tool_use_id: call.id,
    content: JSON.stringify(result.value),
    is_error: false,
  };
}

// Run a tool directly, with its input and output types inferred.
export async function callTool<T extends StandardToolV1>(
  tool: T,
  input: StandardToolV1.InferInput<T>,
): Promise<StandardToolV1.InferOutput<T>> {
  const result = await executeTool(tool, input);

  if (result.issues) {
    throw new Error(JSON.stringify(result.issues, null, 2));
  }

  return result.value as StandardToolV1.InferOutput<T>;
}
