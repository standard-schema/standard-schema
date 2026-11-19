/**
 * This example shows how an AI library adds the Standard Tool interface to
 * its existing `tool` function. Its own API stays the same, and the tools it
 * returns can also be executed by any other library that supports the spec.
 */

import type { StandardSchemaV1, StandardToolV1 } from "@standard-schema/spec";
import {
  createStandardToolFactory,
  type StandardToolSchema,
} from "@standard-schema/utils";

// The existing tool API of your AI library
interface ToolExecuteOptions {
  toolCallId: string;
  abortSignal?: AbortSignal | undefined;
  context?: unknown;
}

interface ToolConfig<TSchema extends StandardToolSchema, TOutput> {
  description: string;
  inputSchema: TSchema;
  execute: (
    input: StandardSchemaV1.InferOutput<TSchema>,
    options: ToolExecuteOptions,
  ) => TOutput | Promise<TOutput>;
}

type Tool<TSchema extends StandardToolSchema, TOutput> = ToolConfig<
  TSchema,
  TOutput
> &
  StandardToolV1<StandardSchemaV1.InferInput<TSchema>, TOutput>;

const createStandardTool = createStandardToolFactory("my-ai-lib");

// Your existing `tool` function, which now also adds the `~standard` property
export function tool<TSchema extends StandardToolSchema, TOutput>(
  config: ToolConfig<TSchema, TOutput>,
): Tool<TSchema, TOutput> {
  const standardTool = createStandardTool({
    description: config.description,
    input: config.inputSchema,
    // map the options of the spec to the options of your API
    execute: (input, options) =>
      config.execute(input, {
        toolCallId: options.callId ?? "",
        abortSignal: options.signal,
        context: options.context,
      }),
  });
  return { ...config, ...standardTool };
}
