/**
 * This example shows how an AI library adds the Standard Tool interface to the
 * tools its existing `tool` function returns. Its API stays the same, its own
 * features stay beside `~standard`, and any framework that accepts Standard
 * Tools can run its tools.
 */

import type {
  StandardJSONSchemaV1,
  StandardSchemaV1,
  StandardToolV1,
} from "@standard-schema/spec";

// The library's schemas already implement both specs.
type ToolSchema<Output> = StandardSchemaV1<unknown, Output> &
  StandardJSONSchemaV1<unknown, Output>;

// The library's existing API. Its tools are registered by key, so they have
// no name of their own.
interface ToolExecutionOptions {
  toolCallId: string;
  abortSignal?: AbortSignal | undefined;
  context?: unknown;
}

interface ToolConfig<Input, Output> {
  description?: string;
  inputSchema: ToolSchema<Input>;
  // a feature only this library has, which other frameworks ignore
  needsApproval?: boolean;
  execute: (input: Input, options: ToolExecutionOptions) => Promise<Output>;
}

// `input` keeps the schema's type, so frameworks that validate can accept it.
type ToolProps<Input, Output> = StandardToolV1.Props<Input, Output> & {
  readonly input: ToolSchema<Input>;
};

type Tool<Input, Output> = ToolConfig<Input, Output> & {
  readonly "~standard": ToolProps<Input, Output>;
};

// The existing `tool` function, which now also adds `~standard`.
export function tool<Input, Output>(
  config: ToolConfig<Input, Output>,
): Tool<Input, Output> {
  return {
    ...config,
    "~standard": {
      version: 1,
      vendor: "my-ai-lib",
      name: "",
      description: config.description ?? "",
      input: config.inputSchema,
      // map the spec's options to the library's own. The library's tools throw
      // for every failure, so each one becomes a rejection, which a framework
      // may not show the model
      execute: async (input, options) => ({
        value: await config.execute(input, {
          toolCallId: options?.callId ?? "",
          abortSignal: options?.signal,
          context: options?.context,
        }),
      }),
    },
  };
}
