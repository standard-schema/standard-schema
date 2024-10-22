# Standard Schema

A consortium of schema library authors have collaborated to craft a standard interface for schema libraries to benefit the entire JavaScript ecosystem. Standard Schema provides third-party libraries a uniform integration to automatically support multiple schema libraries at once, without adding a single runtime dependency. This simplifies implementation, prevents vendor lock-in, and enables innovation, especially for smaller schema libraries with new ideas.

## The Problem

Validation is an essential building block for almost any application. Therefore, it was no surprise to see more and more JavaScript frameworks and libraries start to natively support specific schema libraries. Frameworks like Astro and libraries like the OpenAI SDK have adopted Zod in recent months to streamline the experience for their users. But to be honest, the current situation is far from perfect. Either only a single schema library gets first-party support, because the implementation and maintenance of multiple schema libraries is too complicated and time-consuming, or the choice falls on an adapter or resolver pattern, which is usually maintained by a project's community in their spare time.

For this reason, Colin McDonnell, the creator of Zod, came up with the [idea](https://x.com/colinhacks/status/1634284724796661761) of a standard interface for schema libraries. This interface should be minimal, easy to implement, but powerful enough to support the most important features of popular schema libraries. The goal was to make it easier for other libraries to accept user-defined schemas as part of their API, in a library-agnostic way. After much thought and consideration, Standard Schema was born.

## Use Cases

The first version of Standard Schemas aims to address the most common use cases of schema libraries today. This includes API libraries like tRPC and JavaScript frameworks like Astro and Qwik who secure the client/server communication in a type safe way using schemas. Or projects like the T3 Stack, which uses schemas to validate environment variables. It also includes UI libraries like Nuxt UI and form libraries like Reach Hook Form, which use schemas to validate user inputs. Especially with the rise of TypeScript, schemas became the de facto standard as they drastically improved the developer experience by providing the type information and validation in a single source of truth.

At the moment, Standard Schema deliberately tries to cover only the most common use cases. However, we believe that other use cases, such as integrating schema libraries into AI SDKs like Vercel AI or the OpenAI SDK to generate structured output, can also benefit from a standard interface.

## The Interface

The `StandardSchema` interface defines four properties that a schema library must implement to be compatible. This includes the `~standard` property, which stores the version number and can be used to test whether an object is a Standard Schema. The `~vendor` property stores the name of the schema library. This can be useful for performing vendor-specific operations in special cases. The `~validate` property is a function that validates unknown input and returns the output of the schema if the input is valid or an array of issues otherwise. The `~types` property stores the type information of the schema. This property is intentionally marked as optional, as it does not need to be included at runtime. Standard Schema also provides two utility types, `InferInput` and `InferOutput`, which can be used to easily infer the type information of a schema.

```ts
/**
 * The Standard Schema v1 interface.
 */
export interface StandardSchema<Input = unknown, Output = Input> {
  /**
   * The version number of the standard.
   */
  readonly "~standard": 1;
  /**
   * The vendor name of the schema library.
   */
  readonly "~vendor": string;
  /**
   * Validates unknown input values.
   */
  readonly "~validate": StandardValidate<Output>;
  /**
   * The stored type information of the schema.
   */
  readonly "~types"?: StandardTypes<Input, Output> | undefined;
}
```

## Implementation

Two parties are required for Standard Schema to work. First, the schema libraries that implement the standard interface, and second, the third-party libraries that accept schemas as part of their API that follow the standard interface.

### Schema Library

Schemas libraries that want to support Standard Schema must implement its interface. This includes adding the `~standard`, `~vendor`, `~validate`, and `~types` properties. To make this process easier, schema libraries can optionally extend their interface from the `StandardSchema` interface.

> It doesn't matter whether your schema library returns plain objects, functions, or class instances. The only thing that matters is that these four properties are defined somehow.

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
    "~standard": 1,
    "~vendor": "valizod",
    '~validate'({ value }) {
      return typeof value === 'string'
        ? { value }
        : { issues: [{ message }] };
    },
  };
}
```

Instead of implementing the `StandardSchema` interface natively into your library code, you can also just add these properties on top and reuse your existing functions within the `~validate` function.

### Third Party

Other than for schema library authors, we recommend third party authors to install the `@standard-schema/spec` package when implementing Standard Schema into their libraries. This package provides the `StandardSchema` interface and the `InferInput` and `InferOutput` utility types.

```sh
npm install @standard-schema/spec --save-dev  # npm
yarn add @standard-schema/spec --dev          # yarn
pnpm add @standard-schema/spec --dev          # pnpm
bun add @standard-schema/spec --dev           # bun
```

After that you can accept any schemas that implement the Standard Schema interface as part of your API. We recommend using a generic that extends the `StandardSchema` interface in most cases to be able to infer the type information of the schema.

```ts
import type { InferOutput, StandardSchema } from "@standard-schema/spec";

// Step 1: Define the schema generic
function createEndpoint<TSchema extends StandardSchema, TOutput>(
  // Step 2: Use the generic to accept a schema
  schema: TSchema,
  // Step 3: Infer the output type from the generic
  handler: (data: InferOutput<TSchema>) => Promise<TOutput>,
) {
  return async (data: unknown) => {
    // Step 4: Use the schema to validate data
    const result = await schema["~validate"]({ value: data });

    // Step 5: Process the validation result
    if (result.issues) {
      throw new Error(result.issues[0].message ?? "Validation failed");
    }
    return handler(result.value);
  };
}
```

#### Common Tasks

There are two common tasks that third-party libraries perform after validation fails. The first is to flatten the issues by creating a dot path to more easily associate the issues with the input data. This is commonly used in form libraries. The second is to throw an error that contains all the issue information. To simplify both tasks, Standard Schema also ships a utils package that provides a `getDotPath` function and a `SchemaError` class.

```sh
npm install @standard-schema/utils   # npm
yarn add @standard-schema/utils      # yarn
pnpm add @standard-schema/utils      # pnpm
bun add @standard-schema/utils       # bun
```

##### Get Dot Path

To generate a dot path, simply pass an issue to the `getDotPath` function. If the issue does not contain a path or the path contains a key that is not of type `string` or `number`, the function returns `null`.

```ts
import type { StandardSchema } from "@standard-schema/spec";
import { getDotPath } from "@standard-schema/utils";

async function getFormErrors(schema: StandardSchema, data: unknown) {
  const result = await schema["~validate"]({ value: data });
  const formErrors: string[] = [];
  const fieldErrors: Record<string, string[]> = {};
  if (result.issues) {
    for (const issue of result.issues) {
      const dotPath = getDotPath(issue);
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

To throw an error that contains all issue information, simply pass the issues of the failed schema validation to the `SchemaError` class. The `SchemaError` class extends the `Error` class with an `issues` property that contains all the issues.

```ts
import type { StandardSchema } from "@standard-schema/spec";
import { SchemaError } from "@standard-schema/utils";

async function validateInput(schema: StandardSchema, data: unknown) {
  const result = await schema["~validate"]({ value: data });
  if (result.issues) {
    throw new SchemaError(result.issues);
  }
  return result.value;
}
```

## Ecosystem

These are the libraries that have already implemented the Standard Schema interface. Feel free to add your library to the list in ascending order by creating a pull request.

### Schema Libraries

- [Valibot](https://github.com/fabian-hiller/valibot): The modular and type safe schema library for validating structural data 🤖

### Third Parties

- [Nuxt UI](https://github.com/nuxt/ui): A UI Library for Modern Web Apps, powered by Vue & Tailwind CSS.
- [tRPC](https://github.com/trpc/trpc): 🧙‍♀️ Move Fast and Break Nothing. End-to-end typesafe APIs made easy.

## FAQ

These are the most frequently asked questions about Standard Schema. If your question is not listed, feel free to create an issue.

### Do I need to include `@standard-schema/spec` as a dependency?

No. The `@standard-schema/spec` package is completely optional. You can just copy and paste the types into your project, or manually add the four properties to your existing types. But you can include `@standard-schema/spec` as a dev dependency and consume it exclusively with `import type`. The `@standard-schema/spec` package contains no runtime code and only exports types.

### Why did you choose to prefix the four property names with `~`?

The goal of prefixing the key names with `~` is to both avoid conflicts with existing API surfaces and to de-prioritize these keys in auto-complete. The `~` character is one of the few ASCII characters that occurs after `A-Za-z0-9` lexicographically, so VS Code puts these suggestions at the bottom of the list.

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

### Should I use the `StandardSchema` or `v1.StandardSchema` type?

As a library author, you should always use the `v1.StandardSchema` type to target a specific version of Standard Schema. For third-party libraries, this doesn't matter, but `StandardSchema` may be preferable to target any version of Standard Schema, even if there is only one version at the moment.

### What should I do if I only accept synchronous validation?

The `~validate` function does not necessarily have to return a `Promise`. If you only accept synchronous validation, you can simply throw an error if the returned value is an instance of the `Promise` class.

```ts
import type { StandardSchema } from "@standard-schema/spec";

function validateInput(schema: StandardSchema, data: unknown) {
  const result = schema["~validate"]({ value: data });
  if (result instanceof Promise) {
    throw new TypeError('Schema validation must be synchronous');
  }
  // ...
}
```
