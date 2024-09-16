/**
 * The base schema interface of Standard Schema.
 */
export interface StandardSchema<Input = unknown, Output = Input> {
  /**
   * The version number of the standard.
   */
  "~standard": number;
  /**
   * The stored type information of the schema.
   */
  "~types"?: StandardTypes<Input, Output> | undefined;
}

/**
 * The base types interface of Standard Schema.
 */
export interface StandardTypes<Input, Output> {
  /**
   * The input type of the schema.
   */
  input: Input;
  /**
   * The output type of the schema.
   */
  output: Output;
}

/**
 * Infers the input type of a Standard Schema.
 */
export type InferInput<Schema extends StandardSchema> = NonNullable<
  Schema["~types"]
>["input"];

/**
 * Infers the output type of a Standard Schema.
 */
export type InferOutput<Schema extends StandardSchema> = NonNullable<
  Schema["~types"]
>["output"];
