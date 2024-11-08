# Standard Schema Spec

A consortium of schema library authors have collaborated to craft a standard interface for schema libraries to benefit the entire JavaScript ecosystem. Standard Schema provides third-party libraries a uniform integration to automatically support multiple schema libraries at once, without adding a single runtime dependency. This simplifies implementation, prevents vendor lock-in, and enables innovation, especially for smaller schema libraries with new ideas. For more information on the origins and use cases of Standard Schema, see [background](#background).

## The Interface

The `StandardSchema` interface is a set of validation-related properties that must be defined under a key called `~standard`.

```ts
/**
 * The Standard Schema interface.
 */
interface StandardSchema<Input = unknown, Output = Input> {
  /**
   * The Standard Schema properties.
   */
  readonly "~standard": StandardSchemaProps<Input, Output>;
}

/**
 * The Standard Schema properties interface.
 */
interface StandardSchemaProps<Input = unknown, Output = Input> {
  /**
   * The version number of the standard.
   */
  readonly version: 1;
  /**
   * The vendor name of the schema library.
   */
  readonly vendor: string;
  /**
   * Validates unknown input values.
   */
  readonly validate: (value: unknown) => StandardResult<Output> | Promise<StandardResult<Output>>;
  /**
   * Inferred types associated with the schema.
   */
  readonly types?: StandardTypes<Input, Output> | undefined;
}
```

- `~standard` contains the Standard Schema properties and can be used to test whether an object is a Standard Schema. 
  - `version` defines the version number of the standard. This can be used in the future to distinguish between different versions of the standard.
  - `vendor` stores the name of the schema libarry. This can be useful for performing vendor-specific operations in special cases. 
  - `validate` is a function that validates unknown input and returns the output of the schema if the input is valid or an array of issues otherwise. This can be discriminated by checking whether the `issues` property is `undefined`.
  - `types` is used to associate type metadata with the schema. This property should be declared on the schema's type, but is not required to exist at runtime. Authors implementing a schema using a class are encouraged to use TypeScript's `declare` keyword or other means to avoid runtime overhead. `InferInput` and `InferOutput` can be used to extract their corresponding types.

## Implementation

Two parties are required for Standard Schema to work. First, the schema libraries that implement the standard interface, and second, the third-party libraries that accept schemas as part of their API that follow the standard interface.

### Schema Library

Schemas libraries that want to support Standard Schema must implement its interface. This includes adding the `~standard` property. To make this process easier, schema libraries can optionally extend their interface from the `StandardSchema` interface.

> It doesn't matter whether your schema library returns plain objects, functions, or class instances. The only thing that matters is that the `~standard` property is defined somehow.

```ts
import type { v1 } from "@standard-schema/spec";

// Step 1: Define the schema interface
interface StringSchema extends v1.StandardSchema<string> {
  type: "string";
  message: string;
}

// Step 2: Implement the schema interface
function string(message: string = "Invalid type"): StringSchema {
  return {
    type: "string",
    message,
    "~standard": {
      version: 1,
      vendor: "valizod",
      validate(value) {
        return typeof value === "string"
          ? { value }
          : { issues: [{ message }] };
      },
    },
  };
}
```

Instead of implementing the `StandardSchema` interface natively into your library code, you can also just add it on top and reuse your existing functions and methods within the `validate` function.

### Third Party

Other than for schema library authors, we recommend third party authors to install the `@standard-schema/spec` package when implementing Standard Schema into their libraries. This package provides the `StandardSchema` interface and the `InferInput` and `InferOutput` utility types.

```sh
npm install @standard-schema/spec --save-dev  # npm
yarn add @standard-schema/spec --dev          # yarn
pnpm add @standard-schema/spec --dev          # pnpm
bun add @standard-schema/spec --dev           # bun
deno add jsr:@standard-schema/spec --dev      # deno
```

> Alternatively, you can also copy and paste [the types](https://github.com/standard-schema/standard-schema/blob/main/packages/spec/src/index.ts) into your project.

After that you can accept any schemas that implement the Standard Schema interface as part of your API. We recommend using a generic that extends the `StandardSchema` interface in most cases to be able to infer the type information of the schema.

```ts
import type { v1 } from "@standard-schema/spec";

// Step 1: Define the schema generic
function createEndpoint<TSchema extends v1.StandardSchema, TOutput>(
  // Step 2: Use the generic to accept a schema
  schema: TSchema,
  // Step 3: Infer the output type from the generic
  handler: (data: v1.InferOutput<TSchema>) => Promise<TOutput>,
) {
  return async (data: unknown) => {
    // Step 4: Use the schema to validate data
    const result = await schema["~standard"].validate(data);

    // Step 5: Process the validation result
    if (result.issues) {
      throw new Error(result.issues[0].message ?? "Validation failed");
    }
    return handler(result.value);
  };
}
```

#### Common Tasks

There are two common tasks that third-party libraries perform after validation fails. The first is to flatten the issues by creating a dot path to more easily associate the issues with the input data. This is commonly used in form libraries. The second is to throw an error that contains all the issue information.

##### Get Dot Path

To generate a dot path, simply map and join the keys of an issue path, if available.

```ts
import type { v1 } from "@standard-schema/spec";

async function getFormErrors(schema: v1.StandardSchema, data: unknown) {
  const result = await schema["~standard"].validate(data);
  const formErrors: string[] = [];
  const fieldErrors: Record<string, string[]> = {};
  if (result.issues) {
    for (const issue of result.issues) {
      const dotPath = issue.path
        ?.map((item) => (typeof item === "object" ? item.key : item))
        .join(".");
      if (dotPath) {
        if (fieldErrors[dotPath]) {
          fieldErrors[dotPath].push(issue.message);
        } else {
          fieldErrors[dotPath] = [issue.message];
        }
      } else {
        formErrors.push(issue.message);
      }
    }
  }
  return { formErrors, fieldErrors };
}
```

##### Schema Error

To throw an error that contains all issue information, simply pass the issues of the failed schema validation to a `SchemaError` class. The `SchemaError` class extends the `Error` class with an `issues` property that contains all the issues.

```ts
import type { v1 } from "@standard-schema/spec";

class SchemaError extends Error {
  public readonly issues: ReadonlyArray<v1.StandardIssue>;
  constructor(issues: ReadonlyArray<v1.StandardIssue>) {
    super(issues[0].message);
    this.name = "SchemaError";
    this.issues = issues;
  }
}

async function validateInput<TSchema extends v1.StandardSchema>(
  schema: TSchema,
  data: unknown,
): Promise<v1.InferOutput<TSchema>> {
  const result = await schema["~standard"].validate(data);
  if (result.issues) {
    throw new SchemaError(result.issues);
  }
  return result.value;
}
```

## Ecosystem

These are the libraries that have already implemented the Standard Schema interface. Feel free to add your library to the list in ascending order by creating a pull request.

### Schema Libraries

- [ArkType](https://github.com/arktypeio/arktype): TypeScript's 1:1 validator, optimized from editor to runtime ⛵
- [Valibot](https://github.com/fabian-hiller/valibot): The modular and type safe schema library for validating structural data 🤖

### Third Parties

- [TanStack Router](https://github.com/tanstack/router): A fully type-safe React router with built-in data fetching, stale-while revalidate caching and first-class search-param APIs.
- [tRPC](https://github.com/trpc/trpc): 🧙‍♀️ Move Fast and Break Nothing. End-to-end typesafe APIs made easy.

## Background


### The Problem

Validation is an essential building block for almost any application. Therefore, it was no surprise to see more and more JavaScript frameworks and libraries start to natively support specific schema libraries. Frameworks like Astro and libraries like the OpenAI SDK have adopted Zod in recent months to streamline the experience for their users. But to be honest, the current situation is far from perfect. Either only a single schema library gets first-party support, because the implementation and maintenance of multiple schema libraries is too complicated and time-consuming, or the choice falls on an adapter or resolver pattern, which is more cumbersome to implement for both sides.

For this reason, Colin McDonnell, the creator of Zod, came up with [the idea](https://x.com/colinhacks/status/1634284724796661761) of a standard interface for schema libraries. This interface should be minimal, easy to implement, but powerful enough to support the most important features of popular schema libraries. The goal was to make it easier for other libraries to accept user-defined schemas as part of their API, in a library-agnostic way. After much thought and consideration, Standard Schema was born.

### Use Cases

The first version of Standard Schemas aims to address the most common use cases of schema libraries today. This includes API libraries like tRPC and JavaScript frameworks like Astro and Qwik who secure the client/server communication in a type safe way using schemas. Or projects like the T3 Stack, which uses schemas to validate environment variables. It also includes UI libraries like Nuxt UI and form libraries like Reach Hook Form, which use schemas to validate user inputs. Especially with the rise of TypeScript, schemas became the de facto standard as they drastically improved the developer experience by providing the type information and validation in a single source of truth.

At the moment, Standard Schema deliberately tries to cover only the most common use cases. However, we believe that other use cases, such as integrating schema libraries into AI SDKs like Vercel AI or the OpenAI SDK to generate structured output, can also benefit from a standard interface.

## FAQ

These are the most frequently asked questions about Standard Schema. If your question is not listed, feel free to create an issue.

### Do I need to include `@standard-schema/spec` as a dependency?

No. The `@standard-schema/spec` package is completely optional. You can just copy and paste the types into your project, or manually add the `~standard` properties to your existing types. But you can include `@standard-schema/spec` as a dev dependency and consume it exclusively with `import type`. The `@standard-schema/spec` package contains no runtime code and only exports types.

### Why did you choose to prefix the `~standard` property with `~`?

The goal of prefixing the key with `~` is to both avoid conflicts with existing API surfaces and to de-prioritize these keys in auto-complete. The `~` character is one of the few ASCII characters that occurs after `A-Za-z0-9` lexicographically, so VS Code puts these suggestions at the bottom of the list.

![Screenshot showing the de-prioritization of the `~` prefix keys in VS Code.](https://github.com/standard-schema/standard-schema/assets/3084745/5dfc0219-7531-481e-9691-cff5bc471378)

### Why don't you use symbols for the keys instead of the `~` prefix?

In TypeScript, using a plain `Symbol` inline as a key always collapses to a simple `symbol` type. This would cause conflicts with other schema properties that use symbols.

```ts
const object = {
  [Symbol.for('~output')]: 'some data',
};
// { [k: symbol]: string }
```

By contrast, declaring the symbol externally makes it "nominally typed". This means that the key is sorted in autocomplete under the variable name (e.g. `testSymbol` below). Thus, these symbol keys don't get sorted to the bottom of the autocomplete list, unlike `~`-prefixed string keys.

![Screenshot showing the prioritization of external symbols in VS Code](https://github.com/standard-schema/standard-schema/assets/3084745/82c47820-90c3-4163-a838-858b987a6bea)

### What should I do if I only accept synchronous validation?

The `~validate` function does not necessarily have to return a `Promise`. If you only accept synchronous validation, you can simply throw an error if the returned value is an instance of the `Promise` class.

```ts
import type { v1 } from "@standard-schema/spec";

function validateInput(schema: v1.StandardSchema, data: unknown) {
  const result = schema["~standard"].validate(data);
  if (result instanceof Promise) {
    throw new TypeError('Schema validation must be synchronous');
  }
  // ...
}
```
