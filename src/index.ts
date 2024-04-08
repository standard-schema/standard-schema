export interface InputSchema {
  ['{type}']: unknown;
}

export const VALIDATION_ERROR = '{validation_error}';
export type VALIDATION_ERROR = '{validation_error}';
export interface ValidationError {
  ['{validation_error}']: true;
  issues: Issue[];
}

export interface Issue {
  message: string;
  path: (string | number | symbol)[];
}

export type OutputType<T extends InputSchema> = T['{type}'];
export type InputType<T extends InputSchema> = T extends { '{input}': infer I }
  ? I
  : OutputType<T>;

export interface StandardSchema<O> {
  ['{type}']: O;
  ['{validate}'](data: unknown): O | ValidationError;
}
export function standardizeSchema<T extends InputSchema>(schema: T) {
  return (schema as unknown) as StandardSchema<T['{type}']>;
}

export function isValidationError(result: unknown): result is ValidationError {
  return (result as ValidationError)[VALIDATION_ERROR] === true;
}
