<h1 align="center">
  <img alt="Standard Schema fire logo" loading="lazy" width="50" height="50" decoding="async" data-nimg="1" style="color:transparent" src="https://standardschema.dev/favicon.svg">
  </br>
  Standard JSON Schema</h1>
<p align="center">
  A standardized JSON Schema representation that preserves inferred type information
  <br/>
  <a href="https://standardschema.dev/json-schema">standardschema.dev/json-schema</a>
</p>
<br/>

<!-- start -->

Standard JSON Schema is a common interface designed to be implemented by JavaScript and TypeScript entities that _are_ or _can be converted to_ JSON Schema.

The goal is to make it easier for ecosystem tools to accept user-defined types (typically defined using schema/validation libraries) without needing to write custom logic or adapters for each supported library. And since Standard JSON Schema is a specification, they can do so with no additional runtime dependencies.

## Motivation

Many libraries need JSON Schema representations of type information:

- API documentation generation (e.g. OpenAPI)
- Tool inputs and structured outputs for AI
- Form generation tools
- Code generation

Previously, type information was commonly destroyed in the process of converting a schema (Zod, ArkType, Valibot) to JSON Schema. This spec provides a standardized, unified JSON Schema representation that preserves inferred type information.

## Who designed it?

The spec was designed by the creators of Zod, Valibot, and ArkType. Recent versions of these libraries already implement the spec (see the [full list of compatible libraries](#what-schema-libraries-support-this-spec) below).

## The interface

The specification consists of a single TypeScript interface `StandardJSONSchemaV1` to be implemented by any library wishing to be spec-compliant.

This interface can be found below in its entirety. Libraries wishing to implement the spec can copy/paste the code block below into their codebase. It's also available at `@standard-schema/spec` on [npm](https://www.npmjs.com/package/@standard-schema/spec) and [JSR](https://jsr.io/@standard-schema/spec).

```typescript
/** The Standard Typed interface. This is a base type extended by other specs. */
export interface StandardTypedV1<Input = unknown, Output = Input> {
  /** The Standard properties. */
  readonly '~standard': StandardTypedV1.Props<Input, Output>;
}

export declare namespace StandardTypedV1 {
  /** The Standard Typed properties interface. */
  export interface Props<Input = unknown, Output = Input> {
    /** The version number of the standard. */
    readonly version: 1;
    /** The vendor name of the schema library. */
    readonly vendor: string;
    /** Inferred types associated with the schema. */
    readonly types?: Types<Input, Output> | undefined;
  }

  /** The Standard Typed types interface. */
  export interface Types<Input = unknown, Output = Input> {
    /** The input type of the schema. */
    readonly input: Input;
    /** The output type of the schema. */
    readonly output: Output;
  }

  /** Infers the input type of a Standard Typed. */
  export type InferInput<Schema extends StandardTypedV1> = NonNullable<
    Schema['~standard']['types']
  >['input'];

  /** Infers the output type of a Standard Typed. */
  export type InferOutput<Schema extends StandardTypedV1> = NonNullable<
    Schema['~standard']['types']
  >['output'];
}

/** The Standard JSON Schema interface. */
export interface StandardJSONSchemaV1<Input = unknown, Output = Input> {
  /** The Standard JSON Schema properties. */
  readonly '~standard': StandardJSONSchemaV1.Props<Input, Output>;
}

export declare namespace StandardJSONSchemaV1 {
  /** The Standard JSON Schema properties interface. */
  export interface Props<Input = unknown, Output = Input>
    extends StandardTypedV1.Props<Input, Output> {
    /** Methods for generating the input/output JSON Schema. */
    readonly jsonSchema: StandardJSONSchemaV1.Converter;
  }

  /** The Standard JSON Schema converter interface. */
  export interface Converter {
    /** Converts the input type to JSON Schema. May throw if conversion is not supported. */
    readonly input: (
      options: StandardJSONSchemaV1.Options
    ) => Record<string, unknown>;
    /** Converts the output type to JSON Schema. May throw if conversion is not supported. */
    readonly output: (
      options: StandardJSONSchemaV1.Options
    ) => Record<string, unknown>;
  }

  /**
   * The target version of the generated JSON Schema.
   *
   * It is *strongly recommended* that implementers support `"draft-2020-12"` and `"draft-07"`, as they are both in wide use. All other targets can be implemented on a best-effort basis. Libraries should throw if they don't support a specified target.
   *
   * The `"openapi-3.0"` target is intended as a standardized specifier for OpenAPI 3.0 which is a superset of JSON Schema `"draft-04"`.
   */
  export type Target =
    | 'draft-2020-12'
    | 'draft-07'
    | 'openapi-3.0'
    // Accepts any string: allows future targets while preserving autocomplete
    | ({} & string);

  /** The options for the input/output methods. */
  export interface Options {
    /** Specifies the target version of the generated JSON Schema. Support for all versions is on a best-effort basis. If a given version is not supported, the library should throw. */
    readonly target: Target;

    /** Explicit support for additional vendor-specific parameters, if needed. */
    readonly libraryOptions?: Record<string, unknown> | undefined;
  }

  /** The Standard types interface. */
  export interface Types<Input = unknown, Output = Input>
    extends StandardTypedV1.Types<Input, Output> {}

  /** Infers the input type of a Standard. */
  export type InferInput<Schema extends StandardTypedV1> =
    StandardTypedV1.InferInput<Schema>;

  /** Infers the output type of a Standard. */
  export type InferOutput<Schema extends StandardTypedV1> =
    StandardTypedV1.InferOutput<Schema>;
}
```

## Design goals

The specification meets a few primary design objectives:

- **Support JSON Schema conversion.** Given a Standard JSON Schema compatible entity, you should be able to generate JSON Schema from it. The spec supports multiple JSON Schema draft versions and formats.
- **Support static type inference.** For TypeScript libraries that do type inference, the specification provides a standard way for them to "advertise" their inferred type, so it can be extracted and used by external tools.
- **Minimal.** It should be easy for libraries to implement this spec in a few lines of code that call their existing functions/methods.
- **Avoid API conflicts.** The entire spec is tucked inside a single object property called `~standard`, which avoids potential naming conflicts with the API surface of existing libraries.
- **Do no harm to DX.** The `~standard` property is tilde-prefixed to [de-prioritize it in autocompletion](https://x.com/colinhacks/status/1816860780459073933). By contrast, an underscore-prefixed property would show up before properties/methods with alphanumeric names.

## What schema libraries support this spec?

These are the libraries that have already implemented the Standard JSON Schema interface. (If you maintain a library that implements the spec, [create a PR](https://github.com/standard-schema/standard-schema/compare) to add yourself!)

The answer to this question is a little more nuanced than with regular _Standard Schema_. The spec can be implemented by any object that _is_ or _can be converted_ to JSON Schema. It's intentionally designed to support multiple use cases.

- Some schemas may directly encapsulate JSON Schema conversion as a method. These schemas can directly implement the spec.
- For bundle size, reasons, other libraries provide external functions for JSON Schema conversion. In these cases, the _result_ of that function will implement the spec.

| Implementer                    | Version(s) | Link                                                   | Notes                                                                     | Usage          |
| ------------------------------ | ---------- | ------------------------------------------------------ | ------------------------------------------------------------------------- | -------------- |
| [Zod](https://zod.dev)         | v4.2+      | [PR](https://github.com/colinhacks/zod/pull/5477)      |                                                                           | [#](#zod)      |
| [ArkType](https://arktype.io/) | v2.1.28    | [PR](https://github.com/arktypeio/arktype/pull/1558)   |                                                                           | [#](#arktype)  |
| [Valibot](https://valibot.dev) | v1.2       | [PR](https://github.com/open-circle/valibot/pull/1372) | via `toStandardJsonSchema()` in `@valibot/to-json-schema` package (v1.5+) | [#](#valibot)  |
| [Zod Mini](https://zod.dev)    | v4.2+      | [PR](https://github.com/colinhacks/zod/pull/5477)      | via `z.toJSONSchema()`                                                    | [#](#zod-mini) |
| [GraphQL Standard Schema](https://github.com/apollographql/graphql-standard-schema) | v0.2.0+    | [PR](https://github.com/apollographql/graphql-standard-schema/pull/8) | | [#](#graphql-standard-schema) |
| [stnl](https://github.com/re-utils/stnl) | v2.1+ | [Commit](https://github.com/re-utils/stnl/commit/3faa7126b15c69e668e242e3bf93ea7fa9c25772) | via `toStandardJSONSchema.v1()` | [#](#stnl) |
| [VineJS](https://github.com/vinejs/vine) | v4.3.0+ | [PR](https://github.com/vinejs/vine/pull/139) | via `validator['~standard'].jsonSchema.input()`

## Usage

Usage examples for each implementing library.

### Zod

```ts
import * as z from 'zod';

z.string() satisfies StandardJSONSchemaV1; // ✅
```

### ArkType

```ts
import {type} from 'arktype';

type('string') satisfies StandardJSONSchemaV1; // ✅
```

### Valibot

```ts
import * as v from 'valibot';
import {toStandardJsonSchema} from '@valibot/to-json-schema';

toStandardJsonSchema(v.string()) satisfies StandardJSONSchemaV1; // ✅
```

### Zod Mini

```ts
import * as z from 'zod/mini';

z.toJSONSchema(z.string()) satisfies StandardJSONSchemaV1; // ✅
```

### GraphQL Standard Schema

```ts
import { GraphQLStandardSchemaGenerator } from "@apollo/graphql-standard-schema";

const generator = new GraphQLStandardSchemaGenerator({ schema, scalarTypes });
const fragmentSchema = generator.getFragmentSchema(
  gql`fragment UserDetails on User { id name }`
);
fragmentSchema satisfies StandardJSONSchemaV1; // ✅
fragmentSchema.serialize satisfies StandardJSONSchemaV1; // ✅
fragmentSchema.deserialize satisfies StandardJSONSchemaV1; // ✅
```

### stnl

```ts
import { t, toStandardJSONSchema } from 'stnl';

toStandardJSONSchema.v1(t.string) satisfies StandardJSONSchemaV1; // ✅
```

## What tools / frameworks accept spec-compliant schemas?

The following tools accept user-defined schemas conforming to the Standard JSON Schema spec. If you maintain a tool that supports Standard JSON Schemas, [create a PR](https://github.com/standard-schema/standard-schema/compare) to add yourself!

When creating a PR to add your tool, please add a new row to the table below with:

- **Integrator**: The name of your tool/framework (as a link to your project)
- **Description**: A brief description of your tool. Should be a sentence fragment with no period at the end, e.g. ("Type-safe OpenAPI framework for Express")
- **Link**: A link to PR/commit where support was merged.

| Integrator | Description | Link |
| ---------- | ----------- | ---- |
| [xsAI](https://github.com/moeru-ai/xsai) | Extra-small AI SDK | [PR](https://github.com/moeru-ai/xsai/pull/238) |
| [GQLoom](https://gqloom.dev/) | Weave GraphQL schema and resolvers using Standard Schema | [PR](https://github.com/modevol-com/gqloom/pull/242) |
| [@restatedev/restate-sdk](https://github.com/restatedev/sdk-typescript/) | Durable functions and agents with typesafe interfaces & clients validation | [Docs](https://docs.restate.dev/develop/ts/serialization) |

## FAQ

These are the most frequently asked questions about Standard JSON Schema. If your question is not listed, feel free to create an issue.

### What's the relationship between this and _Standard Schema_?

Starting with the next `@standard-schema/spec@1.1.0` version, Standard JSON Schema will be published alongside the existing Standard Schema spec.

_Standard JSON Schema_ is _orthogonal_ to _Standard Schema_. This interface contains no affordance for data validation. Think of them as "traits" or "interfaces". Any given object/instance/entity can implement one or both.

### Why multiple `target` values?

Different tooling requires different versions of JSON Schema. Currently there is a divide in the ecosystem between `"draft-07"` and `"draft-2020-12"`. Library authors that implement this spec are encouraged to implement as many formats as is practical, with a special emphasis on `"draft-07"` and `"draft-2020-12"`. Supporting multiple formats is not required to implement the spec; it is entirely on a best-effort basis.

### Does the spec account for future versions of JSON Schema?

Yes, the type signature for `"target"` was intentionally widened with `{} & string`. This allows libraries to support unspecified formats. It also allows the spec to evolve to include future versions of JSON Schema without breaking assignability down the line.

### What's `"openapi-3.0"`?

The OpenAPI 3.0 specification (still in wide use) implements its own schema definition format. It's a superset of JSON Schema `"draft-04"` that's augmented with additional keywords like `nullable`. Despite not being an official JSON Schema draft, it's in wide use and has been included in the list of recommended drafts.

### Why both `jsonSchema.input` and `jsonSchema.output`?

Many schemas perform transformations during validation. For example, a schema might accept a string as input (`"123"`) but output a number (`123`). The input and output types can differ, so their JSON Schema representations need to differ as well. The `jsonSchema.input` method generates a JSON Schema for the input type, while `jsonSchema.output` generates one for the output type. In cases where input and output types are identical, both methods will return the same schema.

### What about error handling?

If a given schema/entity cannot be converted to JSON Schema, the conversion method call may throw. They may also throw if the entity is non-convertible or otherwise cannot be soundly represented as JSON Schema. Any integrating frameworks/libraries should account for this.

### Why is this a separate spec instead of adding to `StandardSchemaV1`?

The two concerns are orthogonal. `StandardSchemaV1` is about validation, while `StandardJSONSchemaV1` is about conversion to a JSON Schema representation. Keeping them separate allows greater flexibility for use cases where only one or the other may be required.

### I'm a schema library author. How do I implement this spec?

Refer to the [implementation example](https://github.com/standard-schema/standard-schema/blob/main/packages/examples/json-implement.ts) for a worked example.

### I want to accept JSON Schema from a user. How do I do that?

Use the interface to accept values from the user.

```ts
// Function that accepts any compliant `StandardJSONSchemaV1`
// and converts it to a JSON Schema.
export function acceptSchema(schema: StandardJSONSchemaV1) {
  // do stuff, e.g.
  return schema['~standard'].jsonSchema.input({
    target: 'draft-2020-12',
  });
}

acceptSchema(z.string());
```

To infer generic type information from the user-defined schema:

```ts
export function parseData<T extends StandardJSONSchemaV1>(
  schema: T,
  data: StandardJSONSchemaV1.InferInput<T> // extract input type
) {
  return {
    /* ... */
  } as StandardJSONSchemaV1.InferOutput<T>; // extract output type
}
```

### What if I want to accept only schemas that implement both `StandardSchema` and `StandardJSONSchema`?

The two specs are implemented as plain TypeScript interfaces, so you can merge them (and any future specs) as needed for your use case.

```ts
export interface CombinedProps<Input = unknown, Output = Input>
  extends StandardSchemaV1.Props<Input, Output>,
    StandardJSONSchemaV1.Props<Input, Output> {}

/**
 * An interface that combines StandardJSONSchema and StandardSchema.
 * */
export interface CombinedSpec<Input = unknown, Output = Input> {
  '~standard': CombinedProps<Input, Output>;
}
```
