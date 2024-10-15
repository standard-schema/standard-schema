/**
 * The base schema interface of Standard Schema.
 */
export interface BaseSchema<Input = unknown, Output = Input> {
  /**
   * The version number of the standard.
   */
  readonly "~standard": number;
  /**
   * Inferred types associated with the schema.
   *
   * IMPORTANT: This is a type-only property-
   * it should be used exclusively for inference
   * will be `undefined` at runtime.
   */
  readonly "~types": StandardTypes<Input, Output>;
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
