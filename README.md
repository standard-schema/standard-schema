> Early draft. Not complete.

# _Standard Schema_

This is a proposal for a standard interface to be adopted across TypeScript validation libraries. The goal is to make it easier for open-source libraries to accept user-defined schemas as part of their API, in a library-agnostic way.

## Usage: Accepting user-defined schemas

Install `standard-schema`, or copy-paste `src/index.ts` into your project.

```sh
pnpm add --dev standard-schema
```

To accept a user-defined schema in your API, use a generic function parameter that extends `InputSchema`.

```ts
import type { InputSchema, OutputType, StandardSchema  } from 'standard-schema';

// example usage in libraries
function inferSchema<T extends InputSchema>(schema: T) {
  return (schema as unknown) as StandardSchema<OutputType<T>>;
}
```

Now that you've accepted a user-define schema, you can validate data with it.

```ts
import type { InputSchema, OutputType, StandardSchema, ValidationError } from 'standard-schema';

// example usage in libraries
function inferSchema<T extends InputSchema>(schema: T) {
  return (schema as unknown) as StandardSchema<OutputType<T>>;
}

function isValidationError(result: unknown): result is ValidationError {
  return (result as ValidationError)["{validation_error}"] === true;
}

const someSchema = /* some user-defined schema */

const standardizedSchema = inferSchema(someSchema);
const data = { name: 'Billie' };
const result = standardizedSchema[Symbol.for('{validate}')](data);

if (isValidationError(result)) {
  result.issues; // detailed error reporting
} else {
  result.name; // fully typed
}
```

## Implementing the standard: schema library authors

The `InputSchema` type is a simple interface. All _Standard Schema_ compatible schemas must conform to this interface.

```ts
interface InputSchema<T> {
  // must be visible in the public type signature
  '{type}': T;

  // can be hidden from the public type signature (private/protected)
  '{validate}': (data: unknown) => T | ValidationError;
}

interface ValidationError {
  '{validation_error}': true;
  issues: Issue[];
}

interface Issue {
  message: string;
  path: (string | number | symbol)[];
}
```

The `{type}` key allows consuming libraries to easily extract the _inferred type_ of your library's schemas. Add the `{type}` property to your base class or interface. This property should correspond to the inferred type of the schema.

```ts
class BaseSchema<T> {
  '{type}': T;
}
```

Next, implement a `{validate}` method that conforms to the following signature.

```ts
type ValidationMethod<T> = (data: unknown) => T | ValidationError;
```

A few additional details:

- The `{validate}` method can be hidden from autocomplete with `private` or `protected`.
- _This method should not throw errors._ Instead, _return_ a `ValidationError` object on failure.

### Example

```ts
class StringSchema {
  '{type}': string;

  // simple parse method
  parse(data: unknown) {
    if (typeof data !== 'string') throw new Error('Expected a string');
    return data;
  }

  // defining a {validate} method that conforms to the standard signature
  // can be private or protected
  private '{validate}'(data: unknown) {
    try {
      return this.parse(data);
    } catch (err) {
      return {
        ['{validation_error}']: true,
        issues: [
          {
            message: err.message,
            path: [],
          },
        ],
      };
    }
  }
}
```

## FAQ

### Why braces `{}`?

The reason this key name The goal of wrapping these keys in `{}` braces is to both avoid conflicts with existing API surface and to de-prioritize these keys in auto-complete. The `{` character is one of the few ASCII characters that occurs after `A-Za-z0-9` lexicographically, so VS Code puts these suggestions at the bottom of the list.

### Why not use symbols for the keys?

In TypeScript, using a plain `Symbol` as a key always collapses to a simple `symbol` type.

```ts
const object = {
  [Symbol.for('test')]: 'some data',
};
// { [k: symbol]: string }
```

Declaring the symbol externally has the opposite problem. The type becomes _too_ specific.

```ts
const testSymbol = Symbol.for('test');
const object = {
  [testSymbol]: 'some data',
};

const anotherTestSymbol = Symbol.for('test');
const anotherObject: typeof object = {
  [anotherTestSymbol]: 'some data',
};
// ^ Object literal may only specify known properties, and '[anotherTestSymbol]' does not exist in type '{ [testSymbol]: string; }'.ts(2353)
```

So if the standard type signatures used a symbol declared with `Symbol.for()`, that exact symbol would need to be exported at runtime and imported by any consuming libraries. This means consumers would need to include `standard-library` as a runtime dependency.

Ideally, it would be possible to ship a _Standard Schema_ compatible library without incurring any new runtime dependencies. (While `standard-schema` does export some utility functions, these are not required to use the _Standard Schema_ format.) Thus, we're left with string literals.

### Why does `{validate}` return a union?

The validation method must conform to the following interface:

```ts
type ValidationMethod<T> = (data: unknown) => T | ValidationError;
```

Note that the validation method should _not_ throw to indicate an error. It's expensive to throw an error in JavaScript, so any standard method signature should support the ability to perform validation without `throw` for performance reasons.

Instead the method returns a union of `T` (the inferred output type) and `ValidationError`.

### How does error reporting work?

On a failed validation, the `{validate}` method returns an object compatible with the `ValidationError` interface.

```ts
interface ValidationError {
  '{validation_error}': true;
  issues: Issue[];
}
```

A `ValidationError` has a `{validation_error}` flag (to distinguish it from `T`) and an `issues` array. Each `Issue` is an object that conforms to the following interface.

```ts
interface Issue {
  message: string;
  path: (string | number | symbol)[];
}
```

This is intended to be as minimal as possible, while supporting common use cases like form validation.

### Why doesn't `ValidationError` extend `Error`?

It _could_ but it doesn't have to (and probably shouldn't). It's expensive to allocate `Error` instances in JavaScript, since it captures the stack trace at the time of creation. Many performance-sensitive libraries don't throw Errors for this reason.

### Why not use a discriminated union?

Many libraries provide a validation method that returns a discriminated union.

```ts
interface Schema<O> {
  '{validate}': (
    data: any
  ) => { success: true; data: O } | { success: false; error: ValidationError };
}
```

This necessarily involves allocating a new object on every parse operation. For performance-sensitive applications, this isn't acceptable.
