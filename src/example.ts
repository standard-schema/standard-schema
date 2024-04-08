import {
  InferSchema,
  STANDARD_SCHEMA,
  ValidationError,
  isValidationError,
  standardizeSchema,
} from '.';

class ZodSchema<T> {
  _output!: T;
  _input!: unknown;
  validate(data: unknown): T {
    return data as T;
  }
  // compatible schemas declare the following metadata about themselves
  ['{standard_schema}'] = {
    // how to extract inferred output type
    outputType: '_output',
    // how to extract inferred input type
    inputType: '_input',
    // the name of the schemas validation method
    // should return (T | ValidationError)
    validateMethod: 'validate',
  } as const;
}

export declare const as: unique symbol;
class ArkType<T> {
  [as]!: T;
  allows(data: unknown): T | ValidationError {
    return data as T;
  }
  ['{standard_schema}'] = {
    outputType: as,
    inputType: as,
    validateMethod: 'allows',
  } as const;
}

// example usage in libraries
function inferSchema<T extends InferSchema>(schema: T) {
  return standardizeSchema(schema);
}

// Zod example
{
  var zodSchema!: ZodSchema<{ name: string }>;
  const schema = inferSchema(zodSchema);
  const result = schema.validate({ name: 'hello' });
  if (isValidationError(result)) {
    console.log(result.issues);
  } else {
    result.name;
  }
}

// ArkType example
{
  var arkTypeSchema!: ArkType<{ name: string }>;
  const schema = inferSchema(arkTypeSchema);
  const result = schema.validate({ name: 'hello' });
  if (isValidationError(result)) {
    console.log(result.issues);
  } else {
    result.name;
  }
}
