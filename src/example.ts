import {
  InputSchema,
  ValidationError,
  StandardSchema,
  OutputType,
  isValidationError,
} from '../src';

class BaseSchema<T> {
  '{type}': T;
  validate(data: unknown): T {
    // do validation logic here
    if (Math.random() < 0.5) return data as T;
    throw new Error('Invalid data');
  }
  private '{validate}'(data: unknown): T | ValidationError {
    try {
      return this.validate(data);
    } catch (err) {
      return {
        '{validation_error}': true,
        issues: [{ message: err.message, path: [] }],
      };
    }
  }
}

// example usage in libraries
function inferSchema<T extends InputSchema>(schema: T) {
  return (schema as unknown) as StandardSchema<OutputType<T>>;
}

declare var someSchema: BaseSchema<{ name: string }>;

const schema = inferSchema(someSchema);
const result = schema['{validate}']({ name: 'hello' });
if (isValidationError(result)) {
  result.issues;
} else {
  result.name;
}


import type { InputSchema, Infer, StandardSchema  } from '.';

// example usage in libraries
function inferSchema<T extends InputSchema>(schema: T) {
  return (schema as unknown) as StandardSchema<OutputType<T>>;
}
const someSchema = /* some user-defined schema */

const standardizedSchema = inferSchema(someSchema);
const result = standardizedSchema[Symbol.for('{validate}')]({ name: 'Billie' });
if (isValidationError(result)) {
  result.issues; // detailed error reporting
} else {
  result.name; // fully typed
}