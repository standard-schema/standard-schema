export interface StandardSchema {
  '~output': unknown;
  '~input'?: unknown;
}

export type OutputType<T extends StandardSchema> = T['~output'];
export type InputType<T extends StandardSchema> = T extends {
  '~input': infer I;
}
  ? I
  : OutputType<T>; // defaults to output type

export type Decorate<T extends StandardSchema> = {
  '~output': OutputType<T>;
  '~input': InputType<T>;
  '~validate'(data: unknown, ...rest: any[]): OutputType<T> | ValidationError;
};

export interface ValidationError {
  '~validationerror': true;
  issues: Issue[];
}

export interface Issue {
  message: string;
  path: (string | number | symbol)[];
}

export function isValidationError(result: any): result is ValidationError {
  return result['~validationerror'] === true;
}
