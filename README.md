> This is a draft! Feel free to submit an issue to start discussions relating to this proposal!

<p align="center">
  <h1 align="center">🦆<br/>`Standard Schema`</h1>
  <br />
  <p align="center">
    A proposal for a common standard interface for TypeScript schema validation libraries.
  </p>
</p>

<p align="center">
  <h1 align="center">🦆<br/><code>Standard Schema</code></h1>
  <p align="center">
    A proposal for a common standard interface for TypeScript and JavaScript schema validation libraries.
  </p>
</p>
This is a proposal for a standard interface to be adopted across TypeScript validation libraries. The goal is to make it easier for open-source libraries to accept user-defined schemas as part of their API, in a library-agnostic way.

## Usage: Accepting user-defined schemas

Install `standard-schema`, or copy-paste `src/index.ts` into your project.

```sh
pnpm add --dev standard-schema
```

To accept a user-defined schema in your API, use a generic function parameter that extends `StandardSchema`.

```ts
import type { StandardSchema, OutputType, Decorate  } from 'standard-schema';

// example usage in libraries
function inferSchema<T extends StandardSchema>(schema: T) {
  return (schema as unknown) as Decorate<T>;
}
```

Now that you've accepted a user-define schema, you can validate data with it.

```ts
import type { StandardSchema, OutputType, Decorate, ValidationError } from 'standard-schema';

// example usage in libraries
function inferSchema<T extends StandardSchema>(schema: T) {
  return (schema as unknown) as Decorate<T>;
}

function isValidationError(result: unknown): result is ValidationError {
  return (result as ValidationError)["~validationerror"] === true;
}

const someSchema = /* some user-defined schema */

const standardizedSchema = inferSchema(someSchema);
const data = { name: 'Billie' };
const result = standardizedSchema['~validate'](data);

if (isValidationError(result)) {
  result.issues; // detailed error reporting
} else {
  result.name; // fully typed
}
```

## Implementing the standard: schema library authors

To make your library compatible with the `Standard Schema` spec, your library must be compatible in both the _static_ and the _runtime_ domain.

### Static domain

This one is easy. Your schemas should conform to the following interface. This is all that's required in the static domain to be compatible with the `Standard Schema` spec.

```ts
interface StandardSchema {
  '~output': unknown;
}
```

The type signature of the `~output` key should correspond to the inferred output type of the schema. This type can be extracted with the `OutputType` utility type.

```ts
export type OutputType<T extends StandardSchema> = T['~output'];
```

### Input types

If your library implements any form of transform or coercion, it's possible the output type can diverge from the expected input type. If this is applicable to your library, your schemas should also include an `~input` key.

```ts
interface StandardSchema {
  '~output': unknown;
  '~input': unknown;
}
```

This key isn't necessary. If it is omitted, the inferred input type of your schema will default to the output type.

```ts
export type InputType<T extends StandardSchema> = T extends {
  '~input': infer I;
}
  ? I
  : OutputType<T>; // defaults to output type
```

### Runtime domain

At runtime, your schemas should implement the following interface.

```ts
interface StandardSchema<T> {
  // can be hidden from the public type signature (private/protected)
  '~validate': (data: unknown) => T | ValidationError;
}

interface ValidationError {
  '~validationerror': true;
  issues: Issue[];
}

interface Issue {
  message: string;
  path: (string | number | symbol)[];
}
```

The `~validate` method _does not_ need to be publicly visible on your schema's type signature. If implemented as an instance method, it can be marked `private` or `protected` on the base class to hide it from your end users.

_Important_: The `~validate` method should not throw errors. Instead, it should either a) return the validated data on success, or b) return a `ValidationError` on failure.

### Example

The following class implements a Standard Schema-compatible `string` validator.

```ts
import type {
	StandardSchema,
	OutputType,
	InputType,
	ValidationError,
	Decorate,
} from ".";

class StringSchema {
	"~output": string;

	// library-specific validation method
	parse(data: unknown): string {
		// do validation logic here
		if (typeof data === "string") return data;
		throw new Error("Invalid data");
	}

	// defining a ~validate method that conforms to the standard signature
	// can be private or protected
	private "~validate"(data: unknown) {
		try {
			return this.parse(data);
		} catch (err) {
			return {
				"~validationerror": true,
				issues: [
					{
						message: (err as Error)?.message,
						path: [],
					},
				],
			};
		}
	}
}
```

## FAQ

### Do I need to include `standard-schema` as a dependency?

You can include `standard-schema` as a dev dependency and consume the library exclusively with `import type`. The library may export some runtime utility functions but they are only available for convenience.

### Why tilde `~`?

The goal of prefixing the key names with `~` is to both avoid conflicts with existing API surface and to de-prioritize these keys in auto-complete. The `~` character is one of the few ASCII characters that occurs after `A-Za-z0-9` lexicographically, so VS Code puts these suggestions at the bottom of the list.

![Screenshot 2024-04-10 at 5 48 30 PM](https://github.com/standard-schema/standard-schema/assets/3084745/5dfc0219-7531-481e-9691-cff5bc471378)

### Why not use symbols for the keys?

In TypeScript, using a plain `Symbol` inline as a key always collapses to a simple `symbol` type. This would cause conflicts with other schema properties that use symbols.

```ts
const object = {
  [Symbol.for('~output')]: 'some data',
};
// { [k: symbol]: string }
```

By contrast, declaring the symbol externally makes it "nominally typed". This means the key is sorted in autocomplete under the variable name (e.g. `testSymbol` below). Thus, these symbol keys don't get sorted to the bottom of the autocomplete list, unlike `{}`-wrapped string keys.

![Screenshot 2024-04-08 at 2 11 35 PM](https://github.com/standard-schema/standard-schema/assets/3084745/4085f5de-bd4f-4b72-8e72-1303674ac412)

### Why does `~validate` return a union?

The validation method must conform to the following interface:

```ts
type ValidationMethod<T> = (data: unknown) => T | ValidationError;
```

Note that the validation method should _not_ throw to indicate an error. It's expensive to throw an error in JavaScript, so any standard method signature should support the ability to perform validation without `throw` for performance reasons.

Instead the method returns a union of `T` (the inferred output type) and `ValidationError`.

### Why not use a discriminated union?

Many libraries provide a validation method that returns a discriminated union.

```ts
interface Schema<O> {
  '~validate': (
    data: any
  ) => { success: true; data: O } | { success: false; error: ValidationError };
}
```

This necessarily involves allocating a new object on every parse operation. For performance-sensitive applications, this isn't acceptable.

### How does error reporting work?

On a failed validation, the `~validate` method returns an object compatible with the `ValidationError` interface.

```ts
interface ValidationError {
  '~validationerror': true;
  issues: Issue[];
}
```

A `ValidationError` has a `~validationerror` flag (to distinguish it from `T`) and an `issues` array. Each `Issue` is an object that conforms to the following interface.

```ts
interface Issue {
  message: string;
  path: (string | number | symbol)[];
}
```

This is intended to be as minimal as possible, while supporting common use cases like form validation.

### Does `ValidationError` extend `Error`?

It _could_ but it doesn't have to (and probably shouldn't). It's expensive to allocate `Error` instances in JavaScript, since it captures the stack trace at the time of creation. Many performance-sensitive libraries don't throw `Errors` for this reason.
