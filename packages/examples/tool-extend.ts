/**
 * This example shows how an AI library adds the Standard Tool interface to
 * its existing `tool` function. Its own API stays the same, and the tools it
 * returns can also be executed by any other library that supports the spec.
 */

import type { StandardSchemaV1, StandardToolV1 } from "@standard-schema/spec";

// The existing tool API of your AI library
interface ToolExecuteOptions {
  toolCallId: string;
  abortSignal?: AbortSignal | undefined;
  context?: unknown;
}

interface ToolConfig<TSchema extends StandardToolV1.Schema, TOutput> {
  description: string;
  inputSchema: TSchema;
  execute: (
    input: StandardSchemaV1.InferOutput<TSchema>,
    options: ToolExecuteOptions,
  ) => TOutput | Promise<TOutput>;
}

type Tool<TSchema extends StandardToolV1.Schema, TOutput> = ToolConfig<
  TSchema,
  TOutput
> &
  StandardToolV1<StandardSchemaV1.InferOutput<TSchema>, TOutput>;

// Your existing `tool` function, which now also adds the `~standard` property
export function tool<TSchema extends StandardToolV1.Schema, TOutput>(
  config: ToolConfig<TSchema, TOutput>,
): Tool<TSchema, TOutput> {
  return {
    ...config,
    "~standard": {
      version: 1,
      vendor: "my-ai-lib",
      description: config.description,
      input: config.inputSchema,
      // map the options of the spec to the options of your API
      execute: (input, options) =>
        config.execute(input, {
          toolCallId: options?.callId ?? "",
          abortSignal: options?.signal,
          context: options?.context,
        }),
    },
  };
}
