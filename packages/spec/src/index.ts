export declare namespace v1 {
  /**
   * The Standard Schema interface.
   */
  export interface StandardSchema<Input = unknown, Output = Input> {
    /**
     * The Standard Schema properties.
     */
    readonly "~standard": StandardSchemaProps<Input, Output>;
  }

  /**
   * The Standard Schema properties interface.
   */
  export interface StandardSchemaProps<Input = unknown, Output = Input> {
    /**
     * The version number of the standard.
     */
    readonly version: number;
    /**
     * The vendor name of the schema library.
     */
    readonly vendor: string;
    /**
     * Validates unknown input values.
     */
    readonly validate: (
      value: unknown,
    ) => StandardOutput<Output> | Promise<StandardOutput<Output>>;
    /**
     * Inferred types associated with the schema.
     */
    readonly types?: (input: Input) => Output;
  }

  /**
   * The output interface of the validate function.
   */
  export type StandardOutput<Output> =
    | StandardSuccessOutput<Output>
    | StandardFailureOutput;

  /**
   * The output interface if validation succeeds.
   */
  export interface StandardSuccessOutput<Output> {
    /**
     * The typed output value.
     */
    readonly value: Output;
    /**
     * The non-existent issues.
     */
    readonly issues?: undefined;
  }

  /**
   * The output interface if validation fails.
   */
  export interface StandardFailureOutput {
    /**
     * The issues of failed validation.
     */
    readonly issues: ReadonlyArray<StandardIssue>;
  }

  /**
   * The issue interface of the failure output.
   */
  export interface StandardIssue {
    /**
     * The error message of the issue.
     */
    readonly message: string;
    /**
     * The path of the issue, if any.
     */
    readonly path?:
      | ReadonlyArray<PropertyKey | StandardPathSegment>
      | undefined;
  }

  /**
   * The path segment interface of the issue.
   */
  export interface StandardPathSegment {
    /**
     * The key representing a path segment.
     */
    readonly key: PropertyKey;
  }

  /**
   * Infers the input type of a Standard Schema.
   */
  export type InferInput<Schema extends StandardSchema> = Parameters<
    NonNullable<Schema["~standard"]["types"]>
  >[0];

  /**
   * Infers the output type of a Standard Schema.
   */
  export type InferOutput<Schema extends StandardSchema> = ReturnType<
    NonNullable<Schema["~standard"]["types"]>
  >;
}
