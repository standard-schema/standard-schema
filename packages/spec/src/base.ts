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
   */
  readonly "~types"?: (Input: Input) => Output
}



/**
 * Infers the input type of a Standard Schema.
 */
export type InferInput<Schema extends BaseSchema> = Parameters<NonNullable<
  Schema["~types"]
>>[0]

/**
 * Infers the output type of a Standard Schema.
 */
export type InferOutput<Schema extends BaseSchema> = ReturnType<NonNullable<
  Schema["~types"]
>>