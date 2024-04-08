type Key = keyof any;
// export const STANDARD_SCHEMA = '{standard_schema}' as const;
export type STANDARD_SCHEMA = '{standard_schema}';
export type InferSchema<
  OutputType extends Key = Key,
  InputType extends Key = Key
> = {
  ['{standard_schema}']: {
    validateMethod: Key;
    outputType: OutputType;
    inputType: InputType;
  };
};

// export const VALIDATION_ERROR = '{standard_validation_error}' as const;
export type VALIDATION_ERROR = '{standard_validation_error}';
export interface ValidationError {
  ['standard_validation_error']: true;
  issues: Array<{ message: string; path: (string | number | symbol)[] }>;
}

export type OutputType<
  T extends InferSchema
> = T[STANDARD_SCHEMA]['outputType'] extends infer OutputKey
  ? OutputKey extends keyof T
    ? T[OutputKey]
    : never
  : never;

export type InputType<
  T extends InferSchema
> = T[STANDARD_SCHEMA]['inputType'] extends infer InputKey
  ? InputKey extends keyof T
    ? T[InputKey]
    : never
  : never;

export interface StandardSchema<O, I> {
  _output: O;
  _input: I;
  validate(data: unknown): O | ValidationError;
}
export function standardizeSchema<T extends InferSchema>(schema: T) {
  return {
    validate: (schema as any)[schema[STANDARD_SCHEMA].validateMethod].bind(
      schema
    ),
  } as StandardSchema<OutputType<T>, InputType<T>>;
}

export function isValidationError(result: unknown): result is ValidationError {
  return (result as ValidationError)[VALIDATION_ERROR] === true;
}

const testSymbol = Symbol.for('test');
const object = {
  [testSymbol]: 'some data',
};

// somewhere else
const anotherTestSymbol = Symbol.for('test');
const anotherObject: typeof object = {
  [anotherTestSymbol]: 'some data',
};
// ^
