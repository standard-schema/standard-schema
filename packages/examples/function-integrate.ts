/**
 * This example shows how to accept Standard Functions in a generic way.
 * It describes functions to a model as tools, runs the ones it calls with the
 * framework's context, and reports the results back to it.
 */

import type { StandardFunctionV1 } from "@standard-schema/spec";

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

// Describing a function doesn't run it, so it can need any options. `never`
// accepts every function and, unlike `any`, doesn't let you run one with
// made-up options.
type AnyFunction = StandardFunctionV1<any, unknown, never>;

// Providers require a non-empty name, so name anonymous functions by position.
function toolName(fn: AnyFunction, index: number): string {
  return fn["~standard"].name || `tool_${index}`;
}

export function describeTools(
  functions: ReadonlyArray<AnyFunction>,
): ToolDefinition[] {
  return functions.map((fn, i) => {
    const schema = fn["~standard"].jsonSchema.input({ target: "draft-07" });
    // model providers only accept object inputs, so reject others up front
    if (schema.type !== "object") {
      throw new TypeError(`Tool ${toolName(fn, i)} must take an object input`);
    }
    return {
      name: toolName(fn, i),
      description: fn["~standard"].description,
      input_schema: schema,
    };
  });
}

// The functions this framework can run: they need at most the standard options,
// with the call id this framework always has, and a context. A function that needs another option, like a stream writer
// this framework doesn't provide, is a type error where it's passed in.
type RunnableFunction<Context> = StandardFunctionV1<
  any,
  unknown,
  { callId: string; context: Context }
>;

// Run the function the model called with the framework's context, and report
// the outcome back to the model. A function that needs more than `Context` is
// a type error where `functions` is passed in.
export async function runToolCall<Context>(
  functions: ReadonlyArray<RunnableFunction<Context>>,
  call: ToolCall,
  context: Context,
  signal?: AbortSignal,
): Promise<ToolResult> {
  const fn = functions.find((fn, i) => toolName(fn, i) === call.name);
  if (!fn) {
    return {
      tool_use_id: call.id,
      content: `Unknown tool: ${call.name}`,
      is_error: true,
    };
  }

  let result: StandardFunctionV1.Result<unknown>;
  try {
    // the function validates the model's arguments itself, so pass them as-is
    result = await fn["~standard"].execute(call.input, {
      signal,
      callId: call.id,
      context,
    });
  } catch {
    // thrown errors are unexpected and may contain internal details, so don't
    // show them to the model
    return {
      tool_use_id: call.id,
      content: "The tool failed unexpectedly.",
      is_error: true,
    };
  }

  if (result.issues) {
    // returned failures are safe to show; input issues tell the model what to fix
    const issues = result.issues.map((issue) =>
      issue.path?.length
        ? `${issue.path.map((p) => (typeof p === "object" ? p.key : p)).join(".")}: ${issue.message}`
        : issue.message,
    );
    const prefix =
      result.source === "input"
        ? "Invalid input, fix it and try again"
        : result.source === "output"
          ? "The tool returned an invalid result"
          : "The tool failed";
    return {
      tool_use_id: call.id,
      content: `${prefix}:\n${issues.join("\n")}`,
      is_error: true,
    };
  }

  return {
    tool_use_id: call.id,
    content: JSON.stringify(result.value) ?? "",
    is_error: false,
  };
}

// An agent that infers the context it must be given from its functions: the
// options needed to run a union of functions are the intersection of theirs.
export function defineAgent<
  const Functions extends ReadonlyArray<RunnableFunction<never>>,
>(config: {
  functions: Functions;
  context: StandardFunctionV1.InferOptions<Functions[number]>["context"];
}): (call: ToolCall) => Promise<ToolResult> {
  // the functions are typed with a `never` context to accept any context, so
  // cast them to the context they were checked against before running them
  const functions = config.functions as unknown as ReadonlyArray<
    RunnableFunction<
      StandardFunctionV1.InferOptions<Functions[number]>["context"]
    >
  >;
  return (call) => runToolCall(functions, call, config.context);
}

// Stream a function's results when it supports streaming, for example to
// show progress, and fall back to `execute` otherwise.
export async function* streamResults<
  Options extends StandardFunctionV1.Options & object,
>(
  fn: StandardFunctionV1<any, unknown, Options>,
  input: unknown,
  options: Options,
): AsyncGenerator<StandardFunctionV1.Result<unknown>> {
  const { executeStream, execute } = fn["~standard"];
  if (executeStream) {
    yield* executeStream(input, options);
  } else {
    yield await execute(input, options);
  }
}
