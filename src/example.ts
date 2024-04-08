import type { InputSchema, OutputType, StandardSchema, ValidationError } from '.';

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

function isValidationError(result: unknown): result is ValidationError {
  return (result as ValidationError)['{validation_error}'] === true;
}

const someSchema = new BaseSchema<{name: string}>()/* some user-defined schema */

const standardizedSchema = inferSchema(someSchema);
const data = { name: 'Billie' };
const result = standardizedSchema[Symbol.for('{validate}')](data);

if (isValidationError(result)) {
  result.issues; // detailed error reporting
} else {
  result.name; // fully typed
}
