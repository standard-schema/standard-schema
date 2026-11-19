import type {
  StandardJSONSchemaV1,
  StandardSchemaV1,
  StandardToolV1,
} from "@standard-schema/spec";

/**
 * The schema of a Standard Tool's input or output.
 */
export type StandardToolSchema<
  Input = unknown,
  Output = Input,
> = StandardSchemaV1<Input, Output> & StandardJSONSchemaV1<Input, Output>;

/**
 * The config of a Standard Tool.
 */
export interface StandardToolConfig<
  TInput,
  TParsed,
  TReturn,
  TOutput,
  TContext,
> {
  /**
   * The name of the tool, if any.
   */
  readonly name?: string | undefined;
  /**
   * The description of the tool, if any.
   */
  readonly description?: string | undefined;
  /**
   * The schema of the input, if any. The input is validated with it before
   * `execute` is called.
   */
  readonly input?: StandardToolSchema<TInput, TParsed> | undefined;
  /**
   * The schema of the output, if any. The value returned by `execute` is
   * validated with it.
   */
  readonly output?: StandardToolSchema<TReturn, TOutput> | undefined;
  /**
   * Executes the tool with a validated input. Throws if it fails.
   */
  readonly execute: (
    input: TParsed,
    options: StandardToolV1.Options<TContext>,
  ) => TReturn | Promise<TReturn>;
}

/**
 * The function that creates a Standard Tool.
 */
export type CreateStandardTool = <
  TInput = unknown,
  TParsed = TInput,
  TReturn = unknown,
  TOutput = TReturn,
  TContext = unknown,
>(
  config: StandardToolConfig<TInput, TParsed, TReturn, TOutput, TContext>,
) => StandardToolV1<TInput, TOutput, TContext>;

/**
 * Creates a `createStandardTool` function with the vendor name of your AI
 * library. Export it, so your users don't need to install this package.
 *
 * The created tools validate their input before running and their output
 * afterwards. Invalid input or output is returned as issues with the source
 * `"input"` or `"output"`. Errors thrown by `execute` are not caught.
 *
 * @param vendor The vendor name of your AI library.
 *
 * @returns The `createStandardTool` function.
 */
export function createStandardToolFactory(vendor: string): CreateStandardTool {
  return (config) => ({
    "~standard": {
      version: 1,
      vendor,
      name: config.name,
      description: config.description,
      input: config.input,
      output: config.output,
      async execute(value, options = {}) {
        let input: unknown = value;
        if (config.input) {
          const result = await config.input["~standard"].validate(value);
          if (result.issues) {
            return { source: "input", issues: result.issues };
          }
          input = result.value;
        }
        let output: unknown = await config.execute(input as never, options);
        if (config.output) {
          const result = await config.output["~standard"].validate(output);
          if (result.issues) {
            return { source: "output", issues: result.issues };
          }
          output = result.value;
        }
        return { value: output as never };
      },
    },
  });
}
