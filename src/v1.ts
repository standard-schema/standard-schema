import { StandardSchema as BaseSchema } from "./base.ts";

/**
 * The Standard Schema v1 interface.
 */
export interface StandardSchema<Input = unknown, Output = Input>
  extends BaseSchema<Input, Output> {
  /**
   * The version number of the standard.
   */
  "~standard": 1;
  /**
   * The vendor name of the schema library.
   */
  "~vendor": string;
  /**
   * Validates unknown input values.
   */
  "~validate": StandardValidate<Output>;
}

/**
 * The validate function interface.
 */
export interface StandardValidate<Output> {
  (input: StandardInput, ...args: any[]): StandardOutput<Output>;
}

/**
 * The async Standard Schema v1 interface.
 */
export interface StandardSchemaAsync<Input = unknown, Output = Input>
  extends BaseSchema<Input, Output> {
  /**
   * The version number of the standard.
   */
  "~standard": 1;
  /**
   * The vendor name of the schema library.
   */
  "~vendor": string;
  /**
   * Validates unknown input values.
   */
  "~validate": StandardValidateAsync<Output>;
}

/**
 * The async validate function interface.
 */
export interface StandardValidateAsync<Output> {
  (input: StandardInput, ...args: any[]): Promise<StandardOutput<Output>>;
}

/**
 * The input interface of the validate function.
 */
export interface StandardInput {
  /**
   * The unknown input value.
   */
  value: unknown;
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
  value: Output;
  /**
   * The non-existent issues.
   */
  issues?: false | null | undefined;
}

/**
 * The output interface if validation fails.
 */
export interface StandardFailureOutput {
  /**
   * The issues of failed validation.
   */
  issues: ReadonlyArray<StandardIssue>;
}

/**
 * The issue interface of the failure output.
 */
export interface StandardIssue {
  /**
   * The error message of the issue.
   */
  message: string;
  /**
   * The path of the issue, if any.
   */
  path?: ReadonlyArray<StandardPathItem> | undefined;
}

/**
 * The path item interface of the issue.
 */
export interface StandardPathItem {
  /**
   * The key of the path item.
   */
  key: unknown;
}
