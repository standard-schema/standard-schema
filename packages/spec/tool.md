<h1 align="center">
  <img alt="Standard Schema fire logo" loading="lazy" width="50" height="50" decoding="async" data-nimg="1" style="color:transparent" src="https://standardschema.dev/favicon.svg">
  </br>
  Standard Tool</h1>
<p align="center">
  A common interface for self-describing, callable tools
  <br/>
  <a href="https://standardschema.dev/tool">standardschema.dev/tool</a>
</p>
<br/>

<!-- start -->

Standard Tool is a common interface designed to be implemented by JavaScript and TypeScript tools that AI models can call.

The goal is to make it easier for frameworks to accept user-defined tools, without needing to write custom logic or adapters for each supported library. And since Standard Tool is a specification, they can do so with no additional runtime dependencies.

## The interface

The specification consists of a single TypeScript interface `StandardToolV1` to be implemented by any library wishing to be spec-compliant. It extends `StandardJSONSchemaV1`, so a tool describes its own input and output as JSON Schema. The rest of the family is included below.

This interface can be found below in its entirety. Libraries wishing to implement the spec can copy/paste the code block below into their codebase. It's also available at `@standard-schema/spec` on [npm](https://www.npmjs.com/package/@standard-schema/spec) and [JSR](https://jsr.io/@standard-schema/spec).

```ts
// #########################
// ###   Standard Typed  ###
// #########################

/** The Standard Typed interface. This is a base type extended by other specs. */
export interface StandardTypedV1<Input = unknown, Output = Input> {
  /** The Standard properties. */
  readonly "~standard": StandardTypedV1.Props<Input, Output>;
}

export declare namespace StandardTypedV1 {
  /** The Standard Typed properties interface. */
  export interface Props<Input = unknown, Output = Input> {
    /** The version number of the standard. */
    readonly version: 1;
    /** The name of the library that implements this interface. */
    readonly vendor: string;
    /** Arbitrary metadata the vendor associates with this entity, such as a title or examples. Not interpreted by the spec. */
    readonly meta?: Record<string, unknown> | undefined;
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
    Schema["~standard"]["types"]
  >["input"];

  /** Infers the output type of a Standard Typed. */
  export type InferOutput<Schema extends StandardTypedV1> = NonNullable<
    Schema["~standard"]["types"]
  >["output"];
}

// ##########################
// ###   Standard Schema  ###
// ##########################

/** The Standard Schema interface. */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  /** The Standard Schema properties. */
  readonly "~standard": StandardSchemaV1.Props<Input, Output>;
}

export declare namespace StandardSchemaV1 {
  /** The Standard Schema properties interface. */
  export interface Props<Input = unknown, Output = Input>
    extends StandardTypedV1.Props<Input, Output> {
    /** Validates unknown input values. */
    readonly validate: (
      value: unknown,
      options?: StandardSchemaV1.Options | undefined,
    ) => Result<Output> | Promise<Result<Output>>;
  }

  /** The result interface of the validate function. */
  export type Result<Output> = SuccessResult<Output> | FailureResult;

  /** The result interface if validation succeeds. */
  export interface SuccessResult<Output> {
    /** The typed output value. */
    readonly value: Output;
    /** A falsy value for `issues` indicates success. */
    readonly issues?: undefined;
  }

  export interface Options {
    /** Explicit support for additional vendor-specific parameters, if needed. */
    readonly libraryOptions?: Record<string, unknown> | undefined;
  }

  /** The result interface if validation fails. */
  export interface FailureResult {
    /** The issues of failed validation. */
    readonly issues: ReadonlyArray<Issue>;
    /**
     * A human-readable summary of the failure, if provided by the library.
     * When present, prefer it over deriving a message from `issues`.
     */
    readonly message?: string | undefined;
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

// ###############################
// ###   Standard JSON Schema  ###
// ###############################

/** The Standard JSON Schema interface. */
export interface StandardJSONSchemaV1<Input = unknown, Output = Input> {
  /** The Standard JSON Schema properties. */
  readonly "~standard": StandardJSONSchemaV1.Props<Input, Output>;
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
    /** Converts the input type to JSON Schema. Throws if and only if an option is unsupported. Unknown or unrepresentable input is converted to `{}`. */
    readonly input: (
      options: StandardJSONSchemaV1.Options,
    ) => Record<string, unknown>;
    /** Converts the output type to JSON Schema. Throws if and only if an option is unsupported. Unknown or unrepresentable output is converted to `{}`. */
    readonly output: (
      options: StandardJSONSchemaV1.Options,
    ) => Record<string, unknown>;
  }

  /**
   * The target version of the generated JSON Schema.
   *
   * It is *strongly recommended* that implementers support `"draft-2020-12"` and `"draft-07"`, as they are both in wide use. All other targets can be implemented on a best-effort basis. Libraries must throw if they don't support a specified target.
   *
   * The `"openapi-3.0"` target is intended as a standardized specifier for OpenAPI 3.0 which is a superset of JSON Schema `"draft-04"`.
   */
  export type Target =
    | "draft-2020-12"
    | "draft-07"
    | "openapi-3.0"
    // Accepts any string: allows future targets while preserving autocomplete
    | ({} & string);

  /** The options for the input/output methods. */
  export interface Options {
    /** Specifies the target version of the generated JSON Schema. Support for all versions is on a best-effort basis. If a given version is not supported, the library must throw. */
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

// ########################
// ###   Standard Tool  ###
// ########################

/** The Standard Tool interface. */
export interface StandardToolV1<
  Input = any,
  Output = unknown,
  Context = unknown,
> {
  /** The Standard Tool properties. */
  readonly "~standard": StandardToolV1.Props<Input, Output, Context>;
}

export declare namespace StandardToolV1 {
  /** The Standard Tool properties interface. */
  export interface Props<Input = any, Output = unknown, Context = unknown>
    extends StandardJSONSchemaV1.Props<Input, Output> {
    /** The name of the function. Set to "" for anonymous tools. */
    readonly name: string;
    /** A description of the function's functionality. Set to "" for undescribed tools. */
    readonly description: string;
    /**
     * Runs the tool. `input` is expected to match `jsonSchema.input`, and the result to match `jsonSchema.output`. Throws if the tool fails, including when its input is invalid.
     */
    readonly execute: (
      input: Input,
      ...options: ExecuteOptions<Context>
    ) => Output | Promise<Output>;
    /** Inferred types associated with the tool. */
    readonly types?: Types<Input, Output> | undefined;
  }

  /** The options passed by callers as the second argument of `execute`. */
  export interface Options<Context = unknown> {
    /** Aborted when the caller no longer needs the result, so the tool can stop its work early. */
    readonly signal?: AbortSignal | undefined;
    /** The identifier of the tool call being executed, such as the id the model assigned to it. Omitted if the caller has none. */
    readonly callId?: string | undefined;
    /** What the tool needs from its caller to run, like a database client or the current user. */
    readonly context?: Context;
  }

  /** The options argument of `execute`, which is required along with its `context` unless `Context` includes `undefined`. */
  export type ExecuteOptions<Context = unknown> = undefined extends Context
    ? [options?: Options<Context>]
    : [options: Options<Context> & { readonly context: Context }];

  /** Your environment's built-in `AbortSignal` type, or `any` if it can't be detected. */
  export type AbortSignal = typeof globalThis extends {
    AbortSignal: { prototype: infer Signal };
  }
    ? Signal
    : any;

  /** The Standard Tool types interface. */
  export interface Types<Input = unknown, Output = unknown>
    extends StandardTypedV1.Types<Input, Output> {}

  /** Infers the input type of a Standard. */
  export type InferInput<Schema extends StandardTypedV1> =
    StandardTypedV1.InferInput<Schema>;

  /** Infers the output type of a Standard. */
  export type InferOutput<Schema extends StandardTypedV1> =
    StandardTypedV1.InferOutput<Schema>;

  /** Infers the context type of a Standard Tool. */
  export type InferContext<Tool extends StandardToolV1<any, any, never>> =
    Tool extends StandardToolV1<any, any, infer Context> ? Context : never;
}
```

## Design goals

The specification meets a few primary design objectives:

- **Support tool calling.** Given a Standard Tool, you should be able to describe it to a model with its name, description and input JSON Schema, and run it with the arguments the model produces.
- **Support cancellation.** Callers can pass an `AbortSignal` to `execute`, so a tool can stop its work early once its result is no longer needed.
- **Support caller context.** A tool can declare a `Context` it needs from its caller, like a database client or the current user, and callers pass it to `execute`. A tool needing a context its caller does not provide is a type error, not a crash at runtime.
- **Support static type inference.** For TypeScript libraries that do type inference, the specification provides a standard way for them to "advertise" a tool's input and output types, so they can be extracted and used by frameworks.
- **Minimal.** It should be easy for libraries to implement this spec in a few lines of code that call their existing functions/methods.
- **Avoid API conflicts.** The entire spec is tucked inside a single object property called `~standard`, which avoids potential naming conflicts with the API surface of existing libraries.
- **Do no harm to DX.** The `~standard` property is tilde-prefixed to [de-prioritize it in autocompletion](https://x.com/colinhacks/status/1816860780459073933). By contrast, an underscore-prefixed property would show up before properties/methods with alphanumeric names.

## What libraries implement the spec?

These are the libraries that have already implemented the Standard Tool interface. (If you maintain a library that implements the spec, [create a PR](https://github.com/standard-schema/standard-schema/compare) to add yourself!)

| Implementer | Version(s) | Link |
| ----------- | ---------- | ---- |

## What frameworks accept spec-compliant tools?

The following frameworks accept user-defined tools conforming to the Standard Tool spec. (If you maintain a framework that supports Standard Tools, [create a PR](https://github.com/standard-schema/standard-schema/compare) to add yourself!)

| Integrator | Description | Link |
| ---------- | ----------- | ---- |

## FAQ

These are the most frequently asked questions about Standard Tool. Questions that apply to every spec, like whether to depend on `@standard-schema/spec`, are answered in the [Standard Schema FAQ](https://standardschema.dev/schema#faq). If your question is not listed, feel free to create an issue.

### Who validates a tool's input?

The tool. Callers pass the model's arguments to `execute` as-is, and those arguments are expected to match `jsonSchema.input` but may not. A tool built from a schema library should validate its input with that schema before running, and throw if it is invalid. Callers can then report the error back to the model so it can correct its arguments.

### What if a tool's input isn't an object?

A tool's input can be any type, like a string or an array. Many targets only accept objects: model providers and MCP require a tool's input schema to have `type: "object"`. A framework that can't accept a non-object input should throw a descriptive error when the tool is registered, rather than wrapping the input in an object of its own.

### How does a tool get what it needs from its caller?

Through its `Context`, the third type parameter. A tool that needs a database client declares `StandardToolV1<Input, Output, { db: Db }>`, and callers must pass `execute(input, { context: { db } })`. A tool that needs nothing leaves `Context` as `unknown`, so any caller can run it.

A framework that provides a context types its tools with it, so a tool needing more than the framework provides is rejected at compile time:

```ts
import type { StandardToolV1 } from "@standard-schema/spec";

interface RequestContext {
  db: Db;
  userId: string;
}

function registerTools(
  tools: ReadonlyArray<StandardToolV1<any, unknown, RequestContext>>,
) {
  // each tool is run with `execute(input, { context: requestContext })`
}
```

A framework that provides no context types its tools with `undefined`, as in `StandardToolV1<any, unknown, undefined>`, which accepts every tool whose `Context` includes `undefined`. A plain `StandardToolV1` accepts only tools that need no context at all. A framework that only describes tools without running them can accept every tool, whatever its context, as `StandardToolV1<any, unknown, never>`. Use `never` here, not `any`, since a context of `any` doesn't require one, so it rejects tools that do.

Callers pass their context object as-is, so a tool receives the same object, with the same identity and prototype, that its caller holds. The spec's own options, `signal` and `callId`, sit beside `context` rather than inside it, so no key a tool chooses for its context can collide with them.

### What if two tools need different values for the same context key?

A framework with one context shared by every tool can't provide both, since `{ user: User }` and `{ user: string }` combine to an impossible type. A framework that keys contexts by tool name doesn't have this problem. Otherwise, wrap one of the tools so it reads the value from a different key.

### How to only allow synchronous tools?

The `~standard.execute()` function might return a synchronous value _or_ a `Promise`. If you only accept synchronous tools, you can simply throw an error if it returns an instance of `Promise`.

```ts
import type { StandardToolV1 } from "@standard-schema/spec";

function runTool(tool: StandardToolV1, input: unknown) {
  const output = tool["~standard"].execute(input);
  if (output instanceof Promise) {
    throw new TypeError("Tool execution must be synchronous");
  }
  // ...
}
```
