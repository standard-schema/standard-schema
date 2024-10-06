/**
 * The base schema interface of Standard Schema.
 */
export interface BaseSchema<Input = unknown, Output = Input> {
  /**
   * The version number of the standard.
   */
  readonly "~standard": number;
  /**
   * The stored type information of the schema.
   */
  readonly "~types"?: StandardTypes<Input, Output> | undefined;
}

/**
 * The base types interface of Standard Schema.
 */
export interface StandardTypes<Input, Output> {
  /**
   * The input type of the schema.
   */
  readonly input: Input;
  /**
   * The output type of the schema.
   */
  readonly output: Output;
}

/**
 * Infers the input type of a Standard Schema.
 */
export type InferInput<Schema extends BaseSchema> = NonNullable<
  Schema["~types"]
>["input"];

/**
 * Infers the output type of a Standard Schema.
 */
export type InferOutput<Schema extends BaseSchema> = NonNullable<
  Schema["~types"]
>["output"];
