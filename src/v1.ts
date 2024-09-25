import { StandardSchemaBase as BaseSchema } from "./base.ts";

/**
 * The Standard Schema v1 interface.
 */
export interface StandardSchema<Input = unknown, Output = Input>
  extends BaseSchema<Input, Output> {
  /**
   * The version number of the standard.
   */
  readonly "~standard": 1;
  /**
   * The vendor name of the schema library.
   */
  readonly "~vendor": string;
  /**
   * Validates unknown input values.
   */
  readonly "~validate": StandardValidate<Output>;
}

/**
 * The validate function interface.
 */
export interface StandardValidate<Output> {
  (input: StandardInput, ...args: any[]):
    | Promise<StandardOutput<Output>>
    | StandardOutput<Output>;
}

/**
 * The input interface of the validate function.
 */
export interface StandardInput {
  /**
   * The unknown input value.
   */
  readonly value: unknown;
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
  readonly issues?: never;
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
  readonly path?: ReadonlyArray<PropertyKey | StandardPathItem> | undefined;
}

/**
 * The path item interface of the issue.
 */
export interface StandardPathItem {
  /**
   * The key of the path item.
   */
  readonly key: unknown;
}
