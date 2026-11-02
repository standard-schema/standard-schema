import type {
  StandardFunctionV1,
  StandardJSONSchemaV1,
  StandardSchemaV1,
} from "@standard-schema/spec";
import { FunctionFailure } from "../FunctionFailure/index.ts";

/**
 * The schema of a Standard Function's input or output.
 */
export type StandardFunctionSchema<
  Input = unknown,
  Output = Input,
> = StandardSchemaV1<Input, Output> & StandardJSONSchemaV1<Input, Output>;

/**
 * The config of a Standard Function.
 */
export interface StandardFunctionConfig<
  TInput,
  TParsed,
  TReturn,
  TOutput,
  TOptions extends StandardFunctionV1.Options & object,
> {
  /**
   * The name of the function, if any.
   */
  readonly name?: string | undefined;
  /**
   * The description of the function, if any.
   */
  readonly description?: string | undefined;
  /**
   * The schema of the input, if any. The input is validated with it before
   * `execute` is called.
   */
  readonly input?: StandardFunctionSchema<TInput, TParsed> | undefined;
  /**
   * The schema of the output, if any. The value returned by `execute` is
   * validated with it.
   */
  readonly output?: StandardFunctionSchema<TReturn, TOutput> | undefined;
  /**
   * Executes the function with a validated input and the caller's options.
   * Throws a `FunctionFailure` to report a failure its caller may act on.
   */
  readonly execute: (
    input: TParsed,
    options: StandardFunctionV1.Options & TOptions,
  ) => TReturn | Promise<TReturn>;
}

/**
 * The function that creates a Standard Function.
 */
export type CreateStandardFunction = <
  TInput = unknown,
  TParsed = TInput,
  TReturn = unknown,
  TOutput = TReturn,
  TOptions extends StandardFunctionV1.Options &
    object = StandardFunctionV1.Options,
>(
  config: StandardFunctionConfig<TInput, TParsed, TReturn, TOutput, TOptions>,
) => StandardFunctionV1<TInput, TOutput, TOptions>;

/**
 * Creates a `createStandardFunction` function with the vendor name of your
 * library. Export it, so your users don't need to install this package.
 *
 * The created functions validate their input before running and their output
 * afterwards. Invalid input or output is returned as issues with the source
 * `"input"` or `"output"`, and a `FunctionFailure` thrown by `execute` as an
 * issue with the source `"execution"`. Other errors are not caught.
 *
 * @param vendor The vendor name of your library.
 *
 * @returns The `createStandardFunction` function.
 */
export function createStandardFunctionFactory(
  vendor: string,
): CreateStandardFunction {
  return (config) => ({
    "~standard": {
      version: 1,
      vendor,
      name: config.name ?? "",
      description: config.description ?? "",
      jsonSchema: {
        // without a schema, the input or output can be any value
        input: (options) =>
          config.input?.["~standard"].jsonSchema.input(options) ?? {},
        output: (options) =>
          config.output?.["~standard"].jsonSchema.output(options) ?? {},
      },
      async execute(value, options) {
        let input: unknown = value;
        if (config.input) {
          const result = await config.input["~standard"].validate(value);
          if (result.issues) {
            return { source: "input", issues: result.issues };
          }
          input = result.value;
        }
        let output: unknown;
        try {
          output = await config.execute(input as never, options);
        } catch (error) {
          if (!(error instanceof FunctionFailure)) {
            throw error;
          }
          return { source: "execution", issues: [{ message: error.message }] };
        }
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
