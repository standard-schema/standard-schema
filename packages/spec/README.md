# Standard Schema

Standard Schema is a standard interface designed to be implemented by all JavaScript and TypeScript schema libraries.

The goal is to make it easier for other frameworks and libraries to accept user-defined schemas, without needing to implement a custom adapter for each schema library. Because Standard Schema is a specification, they can do so with no additional runtime dependencies.

## Who designed it? 

The spec was designed by the creators of Zod, Valibot, and ArkType. Recent versions of these libraries already implement the spec (see the [full list](#implementation) of implementers below).

For more information on the origins and use cases of Standard Schema, see [background](#background).

## The interface

The specification consists of a single TypeScript interface (`StandardSchemaV1`) that must be implemented by any schema library wishing to be spec-compliant. This interface is defined below in it's entirety. 

> Libraries wishing to implement the spec can copy/paste the code block below into their codebase. It's also available at `@standard-schema/spec` on npm and JSR.

```ts
/** The Standard Schema interface. */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  /** The Standard Schema properties. */
  readonly "~standard": StandardSchemaV1.Props<Input, Output>;
}

export declare namespace StandardSchemaV1 {
  /** The Standard Schema properties interface. */
  export interface Props<Input = unknown, Output = Input> {
    /** The version number of the standard. */
    readonly version: 1;
    /** The vendor name of the schema library. */
    readonly vendor: string;
    /** Validates unknown input values. */
    readonly validate: (
      value: unknown,
    ) => Result<Output> | Promise<Result<Output>>;
    /** Inferred types associated with the schema. */
    readonly types?: Types<Input, Output> | undefined;
  }

  /** The result interface of the validate function. */
  export type Result<Output> = SuccessResult<Output> | FailureResult;

  /** The result interface if validation succeeds. */
  export interface SuccessResult<Output> {
    /** The typed output value. */
    readonly value: Output;
    /** The non-existent issues. */
    readonly issues?: undefined;
  }

  /** The result interface if validation fails. */
  export interface FailureResult {
    /** The issues of failed validation. */
    readonly issues: ReadonlyArray<Issue>;
  }

  /** The issue interface of the failure output. */
  export interface Issue {
    /** The error message of the issue. */
    readonly message: string;
    /** The path of the issue, if any. */
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
  }

  /** The path segment interface of the issue. */
  export interface PathSegment {
    /** The key representing a path segment. */
    readonly key: PropertyKey;
  }

  /** The Standard Schema types interface. */
  export interface Types<Input = unknown, Output = Input> {
    /** The input type of the schema. */
    readonly input: Input;
    /** The output type of the schema. */
    readonly output: Output;
  }

  /** Infers the input type of a Standard Schema. */
  export type InferInput<Schema extends StandardSchemaV1> = NonNullable<
    Schema["~standard"]["types"]
  >["input"];

  /** Infers the output type of a Standard Schema. */
  export type InferOutput<Schema extends StandardSchemaV1> = NonNullable<
    Schema["~standard"]["types"]
  >["output"];
}
```

## Design goals

The specification meets a few primary design objectives:

1. **Supports runtime validation.** Given a Standard Schema compatible validator, you should be able to validate data with it. Any validation errors should be presented in a standardized format.
2. **Supports static type inference.** For TypeScript libraries that do type inference, the specification provides a standard way for them to "advertise" their inferred type, so it can be extracted and used by external tools.
3. **Minimal.** It should be easy for libraries to implement this spec in a few lines of code that call their existing `parse/validate` methods.
4. **Avoids API conflicts.** The entire spec is tucked inside a single object property called `~standard`, which avoids potential naming conflicts with the API surface of existing libraries.
5. **Does no harm to DX.** The `~standard` property is tilde-prefixed to [de-prioritize it in autocompletion](https://x.com/colinhacks/status/1816860780459073933). By contrast, an underscore-prefixed property would show up before properties/methods with alphanumeric names.



<!-- #### Common Tasks

There are two common tasks that third-party libraries perform after validation fails. The first is to flatten the issues by creating a dot path to more easily associate the issues with the input data. This is commonly used in form libraries. The second is to throw an error that contains all the issue information.

##### Get Dot Path

To generate a dot path, simply map and join the keys of an issue path, if available.

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";

async function getFormErrors(schema: StandardSchemaV1, data: unknown) {
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
import type { StandardSchemaV1 } from "@standard-schema/spec";

class SchemaError extends Error {
  public readonly issues: ReadonlyArray<StandardSchemaV1.Issue>;
  constructor(issues: ReadonlyArray<StandardSchemaV1.Issue>) {
    super(issues[0].message);
    this.name = "SchemaError";
    this.issues = issues;
  }
}

async function validateInput<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  data: unknown,
): Promise<StandardSchemaV1.InferOutput<TSchema>> {
  const result = await schema["~standard"].validate(data);
  if (result.issues) {
    throw new SchemaError(result.issues);
  }
  return result.value;
}
``` -->

## What schema libraries implement the spec?

These are the libraries that have already implemented the Standard Schema interface. Feel free to add your library to the list **in ascending order** by creating a pull request.


  | Implementer | Version(s) | Docs |
  |-------------|-------------|------|
  | Zod         | 3.24.0+     | [zod.dev](https://zod.dev/) |
  | Valibot     | v1.0 (including RCs) | [valibot.dev](https://valibot.dev/) |
  | ArkType     | v2.0+       | [arktype.io](https://arktype.io/) |
  | Arri Schema | v0.71.0+    | [github.com/modiimedia/arri](https://github.com/modiimedia/arri) |

<!-- - [ArkType](https://github.com/arktypeio/arktype): TypeScript's 1:1 validator, optimized from editor to runtime ⛵
- [Arri Schema](https://github.com/modiimedia/arri): Type safe validator and schema builder that can be compiled to other languages
- [Valibot](https://github.com/fabian-hiller/valibot): The modular and type safe schema library for validating structural data 🤖
- [Zod](https://github.com/colinhacks/zod) (v3.24+): TypeScript-first schema validation with static type inference -->

## What tools / frameworks accept spec-compliant schemas?

| Integrator | Description |
|------------|-------------|
| [tRPC](https://github.com/trpc/trpc) | 🧙‍♀️ Move fast and break nothing. End-to-end typesafe APIs made easy |
| [TanStack Form](https://github.com/TanStack/form) | 🤖 Headless, performant, and type-safe form state management for TS/JS, React, Vue, Angular, Solid, and Lit |
| [TanStack Router](https://github.com/tanstack/router) | A fully type-safe React router with built-in data fetching, stale-while revalidate caching and first-class search-param APIs |
| [UploadThing](https://github.com/pingdotgg/uploadthing) | File uploads for modern web devs |
| [Formwerk](https://github.com/formwerkjs/formwerk) | A Vue.js Framework for building high-quality, accessible, delightful forms. |
| [GQLoom](https://github.com/modevol-com/gqloom) | Weave GraphQL schema and resolvers using Standard Schema |
| [Nuxt UI](https://github.com/nuxt/ui) | A UI Library for modern web apps, powered by Vue & Tailwind CSS |
| [oRPC](https://github.com/unnoq/orpc) | Typesafe APIs made simple 🪄 |
| [Regle](https://github.com/victorgarciaesgi/regle) | Type-safe model-based form validation library for Vue.js |

<!-- 
- [Formwerk](https://github.com/formwerkjs/formwerk): A Vue.js Framework for building high-quality, accessible, delightful forms.
- [GQLoom](https://github.com/modevol-com/gqloom): Weave GraphQL schema and resolvers using Standard Schema.
- [Nuxt UI](https://github.com/nuxt/ui): A UI Library for Modern Web Apps, powered by Vue & Tailwind CSS.
- [oRPC](https://github.com/unnoq/orpc): Typesafe API's Made Simple 🪄
- [Regle](https://github.com/victorgarciaesgi/regle): Type safe model-based form validation library for Vue.js
- [renoun](https://www.renoun.dev/): The Documentation Toolkit for React
- [TanStack Form](https://github.com/TanStack/form): 🤖 Headless, performant, and type-safe form state management for TS/JS, React, Vue, Angular, Solid, and Lit.
- [TanStack Router](https://github.com/tanstack/router): A fully type-safe React router with built-in data fetching, stale-while revalidate caching and first-class search-param APIs.
- [tRPC](https://github.com/trpc/trpc): 🧙‍♀️ Move Fast and Break Nothing. End-to-end typesafe APIs made easy.
- [UploadThing](https://github.com/pingdotgg/uploadthing): File uploads for modern web devs -->

<!-- ## Background

### The Problem

Validation is an essential building block for almost any application. Therefore, it was no surprise to see more and more JavaScript frameworks and libraries start to natively support specific schema libraries. Frameworks like Astro and libraries like the OpenAI SDK have adopted Zod in recent months to streamline the experience for their users. But to be honest, the current situation is far from perfect. Either only a single schema library gets first-party support, because the implementation and maintenance of multiple schema libraries is too complicated and time-consuming, or the choice falls on an adapter or resolver pattern, which is more cumbersome to implement for both sides.

For this reason, Colin McDonnell, the creator of Zod, came up with [the idea](https://x.com/colinhacks/status/1634284724796661761) of a standard interface for schema libraries. This interface should be minimal, easy to implement, but powerful enough to support the most important features of popular schema libraries. The goal was to make it easier for other libraries to accept user-defined schemas as part of their API, in a library-agnostic way. After much thought and consideration, Standard Schema was born.

### Use Cases

The first version of Standard Schemas aims to address the most common use cases of schema libraries today. This includes API libraries like tRPC and JavaScript frameworks like Astro and Qwik who secure the client/server communication in a type safe way using schemas. Or projects like the T3 Stack, which uses schemas to validate environment variables. It also includes UI libraries like Nuxt UI and form libraries like Reach Hook Form, which use schemas to validate user inputs. Especially with the rise of TypeScript, schemas became the de facto standard as they drastically improved the developer experience by providing the type information and validation in a single source of truth.

At the moment, Standard Schema deliberately tries to cover only the most common use cases. However, we believe that other use cases, such as integrating schema libraries into AI SDKs like Vercel AI or the OpenAI SDK to generate structured output, can also benefit from a standard interface. -->

## Integration

Standard Schema requires buy-in from two parties: schema libraries (henceforth "implementors") and the various frameworks/libraries that accept user-defined schemas ("integrators").

### Implementers

Schemas libraries that want to support Standard Schema must implement the `StandardSchemaV1` interface. Start by copying the specification file above into your library. It consists of types only. 

Then implement the implement by adding the `~standard` property to your validator objects/instances. We recommend using `extends`/`implements` to ensure static agreement with the interface.

> It doesn't matter whether your schema library returns plain objects, functions, or class instances. The only thing that matters is that the `~standard` property is defined somehow.

Here's a simple worked example of a string validator that implements the spec.

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";

// Step 1: Define the schema interface
interface StringSchema extends StandardSchemaV1<string> {
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

We recommend defining the `~standard.validate()` function in terms of your library's existing validation functions/methods. Ideally implementing the spec only requires a handful of lines of code.

### Integrators

Third-party libraries and frameworks can take advantage of Standard Schema to accept user-defined schemas in a type-safe way. 

To get started, copy/paste the specification file into your project. Alternatively (if you are okay with the extra dependency), you can install the `@standard-schema/spec` package from npm.


```sh
npm install @standard-schema/spec --save-dev  # npm
yarn add @standard-schema/spec --dev          # yarn
pnpm add @standard-schema/spec --dev          # pnpm
bun add @standard-schema/spec --dev           # bun
deno add jsr:@standard-schema/spec --dev      # deno
```

Here's is an simple example of a generic function that accepts an arbitrary spec-compliant validator and uses it to parse some data.

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";

export async function standardValidate<T extends StandardSchemaV1>(
  schema: T,
  input: StandardSchemaV1.InferInput<T>,
): Promise<StandardSchemaV1.InferOutput<T>> {
  let result = schema["~standard"].validate(input);
  if (result instanceof Promise) result = await result;

  // if the `issues` field exists, the validation failed
  if (result.issues) {
    throw new Error(JSON.stringify(result.issues, null, 2));
  }

  return result.value;
}
```

This concise function can accept inputs from any spec-compliant schema library.

```ts
import * as z from "zod";
import * as v from "valibot";
import { type } from "arktype";

const zodResult = await standardValidate(z.string(), "hello");
const valibotResult = await standardValidate(v.string(), "hello");
const arktypeResult = await standardValidate(type("string"), "hello");
```


## FAQ

These are the most frequently asked questions about Standard Schema. If your question is not listed, feel free to create an issue.

### Do I need to include `@standard-schema/spec` as a dependency?

No. The `@standard-schema/spec` package is completely optional. You can just copy and paste the types into your project. We guarantee no breaking changes without a major version bump. 

But if you don't mind additional dependencies, you can include `@standard-schema/spec` as a dependency and consume it exclusively with `import type`. The `@standard-schema/spec` package contains no runtime code and only exports types.

Despite being types-only, you should *not* install `@standard-schema/spec` as a devDependency. By accepting Standard Schemas as part of your public API, the Standard Schema interface becomes a part of your library's public API in non-development builds. For this to happen, it must be installed as a regular dependency.


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
import type { StandardSchemaV1 } from "@standard-schema/spec";

function validateInput(schema: StandardSchemaV1, data: unknown) {
  const result = schema["~standard"].validate(data);
  if (result instanceof Promise) {
    throw new TypeError('Schema validation must be synchronous');
  }
  // ...
}
```
