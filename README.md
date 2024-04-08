> Early draft. Not complete.

# _Standard Schema_

This is a proposal for a standard interface to be adopted across TypeScript validation libraries. The goal is to make it easier for library authors to accept user-defined schemas as part of their API, in a library-agnostic way.

## Usage: Accepting user-defined schemas

Install `standard-schema` as a dependency (if you wish to use the utility functions) _or_ copy `src/index.ts` into your project.

To accept a user-defined schema in your API, use a generic function parameter that extends `InferSchema`:

```ts
import { type InferSchema, standardizeSchema } from 'standard-schema';

// example usage in libraries
function inferSchema<T extends InferSchema>(schema: T) {
  return standardizeSchema(schema);
}
```

Then pass this schema through the `standardizeSchema` utility function to "convert" it to a standard format with the following type signature.

```ts
interface StandardSchema<O, I> {
  _output: O;
  _input: I;
  validate(data: I): O | ValidationError;
}
```

To validate schema with this schema, you can call the `validate` method. It returns `ValidationError | T`, where `T` is the inferred type of the schema.

```ts
var userDefinedSchema = makeSchema<{ name: string }>();

const schema = inferSchema(zodSchema);
const result = schema.validate({ name: 'hello' });
if (isValidationError(result)) {
  console.log(result.issues);
} else {
  result.name;
}
```

## Usage: Schema library authors

### "Self-documenting" schemas

Instead of forcing all schema libraries to conform to a standard interface, this allows schema libraries to be "self-documenting". All compatible schema must conform to the following interface.

```ts
type InferSchema<OutputType extends Key = Key, InputType extends Key = Key> = {
  ['{schema}']: {
    validateMethod: Key;
    outputType: OutputType;
    inputType: InputType;
  };
};
```

The `{schema}` property corresponds to a metadata object. This metadata objects tells the consuming library how to extract the inferred type from the schema.

All schemas have a `{schema}` property in their type signature. This makes it easy to statically verify that a schema conforms to the _Standard Schema_ format. This `{schema}` property contains the information required to both a) infer static types and b) validate data against the schema at runtime.

### Example

Here's an example of a schema library that conforms to the _Standard Schema_ format.

```ts
class Schema<T> {
  _output: T;
  validate(input: unknown): T | ValidationError;

  ['{schema}']: {
    validateMethod: 'validate';
    outputType: '_output';
    // default to `outputType` if the library has no concept of "input types"
    inputType: '_output';
  };
}
```

A consuming library can use the `InferSchema` utility to infer the type of this schema, then use the contained information to extract the output type and run the validation method.

### Avoiding auto-complete clutter

Is this actually better than asking all libraries to simply conform to a standard interface, like the one below?

```ts
interface StandardSchema<O, I> {
  '{validate}': (data: any) => O | ValidationError;
  '{output}': O;
  '{input}': I;
}
```

One of the goals of this proposal is to make it as east as possible for schema libraries to conform to Standard Schema without cluttering their type signatures.

The main advantage of the proposed approach is that it allows schema libraries to define their own methods and properties on the schema object. It may not be desirable to attach obscure-looking properties like `{validate}` to a schema, where it clutters auto-complete and can confuse users.

<!-- > The runtime validation method doesn't need to be visible in the TypeScript signature. This allows schema libraries to comply with _Standard Schema_ without cluttering up their Intellisense signatures. -->

### Why braces `{}`?

The reason this key name The goal of wrapping these keys in `{}` braces is to both avoid conflicts with existing API surface and to de-prioritize these keys in auto-complete. The `{` character is one of the few ASCII characters that occurs after `A-Za-z0-9` lexicographically, so VS Code puts these suggestions at the bottom of the list.

The downside is that it looks

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

### Why does the validate method return a union?

The validation method must conform to the following interface:

```ts
type ValidationMethod<T> = (data: unknown) => T | ValidationError;
```

Note that the validation method should _not_ throw to indicate an error. It's expensive to throw an error in JavaScript, so any standard method signature should support the ability to perform validation without `throw` for performance reasons.

Instead the method returns a union of `T` (the inferred output type) and `ValidationError`.

```ts
interface ValidationError {
  '{validation_error}': true;
  issues: string[];
}
```

A `ValidationError` must contain a special property to indicate that it's a validation error. This key is sufficiently uncommon that it can be assumed that any data with that key defined is a `ValidationError`, _not_ as successful parse result.

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

Instead, the proposed validation method is expected to return a simple union of `T` and `ValidationError`.

### About `ValidationError`

The notable part of the `ValidationError` interface is what it _doesn't_ include. Namely, there's no indication that it extends `Error`. As mentioned elsewhere, it's expensive to allocate `Error` instances in JavaScript, since it captures the stack trace at the time of creation.

Instead, the `ValidationError` is a simple object with an `issues` property. Each issue is an object that conforms to the following interface.

```ts
interface Issue {
  message: string;
  path: string[];
}
```

This is intended to be as minimal as possible, while supporting common use cases like form validation.
