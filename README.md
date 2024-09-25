> This is a draft! Feel free to submit an issue to start discussions relating to this proposal!

<p align="center">
  <h1 align="center">🦆<br/><code>Standard Schema</code></h1>
  <p align="center">
    A proposal for a common standard interface for TypeScript and JavaScript schema validation libraries.
  </p>
</p>

<br/>

This is a proposal for a standard interface to be adopted across TypeScript validation libraries. The goal is to make it easier for open-source libraries to accept user-defined schemas as part of their API, in a library-agnostic way.Type safety is important, but it doesn't make sense for every API library and framework to implement their own runtime type validation system. This proposal establishes a common pattern for exchanging _type validators_ between libraries.

## The standard interface

```ts
export interface StandardSchema<Input = unknown, Output = unknown> {
  '~standard': number; // version number
  '~types'?: {
    input: Input;
    output: Output;
  };
  '~vendor': string; // optional vendor name
  
  // this must be implemented at runtime 
  // does not need to exist in the type signature
  '~validate': (
    input: { value: unknown },
    ...args: any[] 
  ) => StandardResult<Output> | Promise<StandardResult<Output>>;
}
export type StandardResult<Value> =
  | StandardSuccessResult<Value>
  | StandardFailureResult;

export interface StandardSuccessResult<Value> {
  value: Value;
  issues?: ReadonlyArray<StandardIssue>;
}

export interface StandardFailureResult {
  value?: unknown;
  issues: ReadonlyArray<StandardIssue>;
}

export interface StandardIssue {
  message: string;
  path?: ReadonlyArray<PropertyKey | { key: PropertyKey }>;
}
```

## Accepting user-defined schemas

So, you're building a library and want to accept user-defined schemas. Great!

First, install `standard-schema` as a dev dependency. This package only contains types!

```sh
pnpm add --dev standard-schema
```

To accept a user-defined schema in your API, use a generic function parameter that extends `StandardSchema`.

```ts
import type { v1 } from 'standard-schema';

// example usage in libraries
function inferSchema<T extends v1.StandardSchema>(schema: T): T {
  return schema;
}
```

Here's a complete example of how to validate data with a user-provided schema.

```ts
// example usage in libraries
import { StandardSchema, InferOutput } from 'standard-schema';
import { CoolSchema } from 'some-cool-schema-library'; // not a real library

// example usage in libraries
function acceptSchema<T extends StandardSchema>(schema: T): T   {
  // currently only the first version exists
  if(schema["~standard"] === 1){
    return schema as T;
  }
  throw new Error(`Unrecognized Standard Schema version: ${schema["~standard"]}`);
}
```

Using the generic `acceptSchema` function, you can now accept user-defined schemas in your API.

```ts
const someSchema = new CoolSchema<{ name: string }>();

// 1. accept a user-defined schema via your API
const inputSchema = acceptSchema(someSchema); 

// 2. use the schema to validate data
const value = { name: 'Billie' };
const result = await inputSchema['~validate']({ value });

if (result.issues) {
  result.issues; // readonly StandardIssue[]
} else {
  result.value; // unknown
}

// 3. infer input and output types
type Output = InferOutput<typeof inputSchema>; // { name: string }
type Input = InferInput<typeof inputSchema>; // { name: string }
```

Note the `await` after calling `~validate`. This is because the method can return a `Promise`. You should handle Promises however you see fit in your library.


## Implementing the standard: schema library authors

To make your library compatible with the `Standard Schema` spec, your library must be compatible in both the _static_ and the _runtime_ domain.

### Static domain

Your schemas should conform to the following interface. This is all that's required in the static domain to be compatible with the `Standard Schema` spec.

```ts
interface StandardSchemaBase {
  // which version of Standard Schema this schema is compatible with
  '~standard': number;
  "~vendor": string; // the name of your library
  '~types'?: { output: unknown; input: unknown };
}
```

### Runtime domain

The Standard Schema spec has built-in _versioning_. Successive versions of the spec may require different methods or properties to be defined on your schema at runtime. At the moment there is only one version: `1`. 

To be compatible with Standard Schema v1, your schema needs to implement a single method: `~validate`. The signature is already described above.

> You can hide this method/function from the public-facing type signature if you like, but it isn't necessary. The easiest way to do this is with the `private` modifier (if you're using class definitions).

```ts
abstract class CoolSchema<T> implements v1.StandardSchema<T, T> {
  "~standard": 1; // numeric literal `1`
  "~vendor": "some-cool-schema-library"; // the name of your library
  "~types":{
    input: T;
    output: T;
  };
  
  abstract "~validate"(input: {value: unknown}): v1.StandardOutput<T>;
}

class StringSchema extends CoolSchema<string> {
  override "~validate"(input: {value: unknown}): v1.StandardOutput<string> {
    if(typeof input.value === 'string'){
      return {value: input.value};
    }
    return {issues: [{message: 'not a string'}]};
  }
}
```

## FAQ

### Do I need to include `standard-schema` as a dependency?

You can include `standard-schema` as a dev dependency and consume the library exclusively with `import type`. The `standard-schema` package only exports types. You can also copy-paste the contents of `index.ts` into your project.

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

By contrast, declaring the symbol externally makes it "nominally typed". This means the key is sorted in autocomplete under the variable name (e.g. `testSymbol` below). Thus, these symbol keys don't get sorted to the bottom of the autocomplete list, unlike `~`-prefixed string keys.

![Screenshot 2024-04-10 at 9 33 33 PM](https://github.com/standard-schema/standard-schema/assets/3084745/82c47820-90c3-4163-a838-858b987a6bea)
