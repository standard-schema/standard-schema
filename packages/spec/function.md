<h1 align="center">
  <img alt="Standard Schema fire logo" loading="lazy" width="50" height="50" decoding="async" data-nimg="1" style="color:transparent" src="https://standardschema.dev/favicon.svg">
  </br>
  Standard Function</h1>
<p align="center">
  A common interface for functions that describe their own input and output
  <br/>
  <a href="https://standardschema.dev/function">standardschema.dev/function</a>
</p>
<br/>

<!-- start -->

Standard Function is a common interface designed to be implemented by JavaScript and TypeScript functions that carry runtime type information: a JSON Schema for their input and their output.

A tool an AI model can call is a Standard Function. So is an agent, a model call that returns structured output, or an RPC procedure. The goal is to let frameworks accept functions defined with any library, describe them, and run them with the context they need, without custom logic or adapters for each library. And since Standard Function is a specification, they can do so with no additional runtime dependencies.

## The interface

The specification consists of a single TypeScript interface `StandardFunctionV1` to be implemented by any library wishing to be spec-compliant. It extends `StandardJSONSchemaV1`, so a function describes its own input and output as JSON Schema, and it reports failures with the issues of `StandardSchemaV1`. The rest of the family is included below.

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
      options?: StandardSchemaV1.Options | undefined
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
    | "draft-2020-12"
    | "draft-07"
    | "openapi-3.0"
    // Accepts any string for future targets while preserving autocomplete
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

// ###########################
// ###   Standard Function  ###
// ###########################

/** The Standard Function interface. */
export interface StandardFunctionV1<
  Input = any,
  Output = unknown,
  in Options extends StandardFunctionV1.Options = StandardFunctionV1.Options,
> {
  /** The Standard Function properties. */
  readonly "~standard": StandardFunctionV1.Props<Input, Output, Options>;
}

export declare namespace StandardFunctionV1 {
  /** The Standard Function properties interface. */
  export interface Props<
    Input = any,
    Output = unknown,
    in Options extends StandardFunctionV1.Options = StandardFunctionV1.Options,
  > extends StandardJSONSchemaV1.Props<Input, Output> {
    /** The name of the function. Set to "" if it has none. */
    readonly name: string;
    /** A description of what the function does. Set to "" if it has none. */
    readonly description: string;
    /** Runs the function. Returns a failure the caller may act on, or throws if something unexpected happens. */
    readonly execute: (
      input: Input,
      options: Options,
    ) => Result<Output> | Promise<Result<Output>>;
    /** Runs the function and yields its results as they become available, if supported. */
    readonly executeStream?:
      | ((input: Input, options: Options) => AsyncIterable<Result<Output>>)
      | undefined;
    /** Inferred types associated with the function. */
    readonly types?: Types<Input, Output> | undefined;
  }

  /** The options passed by callers as the second argument of `execute` and `executeStream`: the options every caller may pass, and the `Extra` options a function needs, like its `context` or an option of a specific caller. Extra options with the name of a standard one keep its type. */
  export type Options<
    Extra extends {
      readonly [Key in keyof Extra]: Key extends keyof BaseOptions
        ? BaseOptions[Key]
        : unknown;
    } = object,
  > = BaseOptions & Extra;

  /** The options every caller may pass. */
  export interface BaseOptions {
    /** Aborted when the caller no longer needs the result, so the function can stop its work early. */
    readonly signal?: AbortSignal | undefined;
    /** The id of this call, like the id a model assigned to a tool call. Omitted if the caller has none. */
    readonly callId?: string | undefined;
    /** What the function needs from its caller's code, like a database client or the current user. Passed as-is. */
    readonly context?: unknown;
  }

  /** The result interface of the execute function. */
  export type Result<Output> = SuccessResult<Output> | FailureResult;

  /** The result interface if the function succeeds. */
  export interface SuccessResult<Output> {
    /** The output value. */
    readonly value: Output;
    /** A falsy value for `issues` indicates success. */
    readonly issues?: undefined;
  }

  /** The result interface if the function fails in a way its caller may act on. */
  export interface FailureResult extends StandardSchemaV1.FailureResult {
    /**
     * What the issues are about. Paths of `"input"` and `"output"` issues are relative to that value.
     */
    readonly source: "input" | "output" | "execution";
  }

  /** Your environment's built-in `AbortSignal` type, or `any` if it can't be detected. */
  export type AbortSignal = typeof globalThis extends {
    AbortSignal: { prototype: infer Signal };
  }
    ? Signal
    : any;

  /** The Standard Function types interface. */
  export interface Types<Input = unknown, Output = unknown>
    extends StandardTypedV1.Types<Input, Output> {}

  /** Infers the input type of a Standard Function. */
  export type InferInput<Function extends StandardTypedV1> =
    StandardTypedV1.InferInput<Function>;

  /** Infers the output type of a Standard Function. */
  export type InferOutput<Function extends StandardTypedV1> =
    StandardTypedV1.InferOutput<Function>;

  /** Infers the options needed to run a Standard Function. For a union of functions, infers the options needed to run all of them. */
  export type InferOptions<
    Function extends StandardFunctionV1<any, unknown, never>,
  > = [Function] extends [StandardFunctionV1<any, unknown, infer Options>]
    ? Options
    : never;
}
```

## Design goals

The specification meets a few primary design objectives:

- **Describe and run any function.** Given a Standard Function, you should be able to describe it with its name, description and JSON Schemas, for example as a tool for a model, and run it with the input you have.
- **One interface for tools, agents and model calls.** A function's body is a black box. It may validate, transform, call other functions or call models. Callers only see its input, its output and its failures.
- **Failures the caller can act on.** A function returns failures it wants its caller to see, with the same issues as Standard Schema, and throws for anything unexpected.
- **Support caller context.** A function declares the options it needs from its caller, like a database client in its `context`. A caller that doesn't provide them is a type error, not a crash at runtime.
- **Support cancellation and streaming.** Callers can pass an `AbortSignal`, and functions can stream their results.
- **Support static type inference.** For TypeScript libraries that do type inference, the specification provides a standard way for them to "advertise" a function's input, output and options types, so they can be extracted and used by frameworks.
- **Minimal.** It should be easy for libraries to implement this spec in a few lines of code that call their existing functions/methods.
- **Avoid API conflicts.** The entire spec is tucked inside a single object property called `~standard`, which avoids potential naming conflicts with the API surface of existing libraries.
- **Do no harm to DX.** The `~standard` property is tilde-prefixed to [de-prioritize it in autocompletion](https://x.com/colinhacks/status/1816860780459073933). By contrast, an underscore-prefixed property would show up before properties/methods with alphanumeric names.

## What libraries implement the spec?

These are the libraries that have already implemented the Standard Function interface. (If you maintain a library that implements the spec, [create a PR](https://github.com/standard-schema/standard-schema/compare) to add yourself!)

| Implementer | Version(s) | Link |
| ----------- | ---------- | ---- |

## What frameworks accept spec-compliant functions?

The following frameworks accept user-defined functions conforming to the Standard Function spec. (If you maintain a framework that supports Standard Functions, [create a PR](https://github.com/standard-schema/standard-schema/compare) to add yourself!)

| Integrator | Description | Link |
| ---------- | ----------- | ---- |

## FAQ

These are the most frequently asked questions about Standard Function. Questions that apply to every spec, like whether to depend on `@standard-schema/spec`, are answered in the [Standard Schema FAQ](https://standardschema.dev/schema#faq). If your question is not listed, feel free to create an issue.

### Who validates a function's input?

The function. Callers pass the input they have to `execute` as-is, like the arguments a model produced. That input is expected to match `jsonSchema.input` but may not. A function built from a schema library should validate its input before running and return a failure with `source: "input"` if it is invalid.

### When should a function return a failure instead of throwing?

A returned failure is part of the function's contract: it is something the function chose to tell its caller, so it is safe to show to that caller, including a model. Return one when the caller can act on it, like a model correcting its input.

A thrown error is unexpected, like a bug or a network outage, and may contain internal details. Callers shouldn't show thrown errors to a model as-is.

A failure is a Standard Schema failure with a `source`. Like in Standard Schema, the presence of `issues` indicates a failure:

```ts
import type { StandardFunctionV1 } from "@standard-schema/spec";

function report(result: StandardFunctionV1.Result<unknown>) {
  if (result.issues) {
    // result.source is "input", "output" or "execution"
    return result.issues.map((issue) => issue.message).join("\n");
  }
  return JSON.stringify(result.value);
}
```

### What does `source` mean?

What the issues are about:

- `"input"`: The input the caller passed is the problem, like a missing property or a city that doesn't exist. Issue paths are relative to the input. The same input will fail again, so the caller has to change it.
- `"output"`: The function couldn't produce a valid output. Issue paths are relative to the output. For a function with a deterministic body this is a bug, but for one that calls a model, running it again may succeed. The function did run, so it may have had side effects.
- `"execution"`: The function ran and chose to fail for another reason, like a declined payment.

`source` always refers to the function's own input and output. A function that calls another function, like an agent calling a tool, shouldn't return the inner function's failure as its own, since its paths would point into the wrong value.

### Why are `name` and `description` required?

So callers can always read them. A function without a name or description sets them to `""`. Callers that need them, like a model provider that requires a tool name, can throw or fall back to a name of their own. A name doesn't need to be human-readable: libraries may name functions by the key of a record, the path of a file or anything else.

### What if a function's input isn't an object?

A function's input can be any type, like a string or an array. Many targets only accept objects: model providers and MCP require a tool's input schema to have `type: "object"`. A framework that can't accept a non-object input should throw a descriptive error when the function is registered, rather than wrapping the input in an object of its own.

### What if a function's output can't be described?

Then `jsonSchema.output` returns `{}`, which accepts any value. Like in Standard JSON Schema, the conversion methods throw if they don't support a `target`.

### How does a function get what it needs from its caller?

Through its options, the second argument of `execute`. Their type is the function's third type parameter. Every caller may pass the standard `signal` and `callId`, and what a function needs from its caller's code, like a database client or the current user, goes in `context`. A function that needs a database client is a `StandardFunctionV1<Input, Output, StandardFunctionV1.Options<{ context: { db: Db } }>>`, and callers run it with `execute(input, { context: { db } })`. A function that needs nothing else leaves the type parameter as `StandardFunctionV1.Options`, so any caller can run it with `execute(input, {})`.

Callers pass their context object as-is, so a function receives the same object, with the same identity and prototype, that its caller holds. The spec doesn't say what goes in a context or how its keys are named. Anything a function needs from its caller's code belongs there, like a database client, the current user, a way to report usage or progress, or a tracing span.

### What about options a framework provides, like a stream writer?

A framework may pass options of its own next to the standard ones, like a writer for streaming progress, the messages of a conversation, or a way to suspend a run. A function that uses them says so in its options type:

```ts
import type { StandardFunctionV1 } from "@standard-schema/spec";

type SearchOptions = StandardFunctionV1.Options<{
  context: { db: Db };
  writer: { write(chunk: string): void };
}>;

type Search = StandardFunctionV1<{ query: string }, string[], SearchOptions>;
```

Such a function only runs where a caller provides a compatible `writer`, and anywhere else it's a type error. A function that only needs the standard options and a context runs with every caller that provides that context. An option with the name of a standard one keeps its type, so `StandardFunctionV1.Options<{ callId: number }>` is a type error.

### How do I accept functions that need the options my framework provides?

Type them with those options. Options are something a function receives, so a function that needs less than the framework provides is accepted, and one that needs more is rejected at compile time:

```ts
import type { StandardFunctionV1 } from "@standard-schema/spec";

type FrameworkOptions = StandardFunctionV1.Options<{
  context: { db: Db; userId: string };
  writer: { write(chunk: string): void };
}>;

function registerTools(
  tools: ReadonlyArray<StandardFunctionV1<any, unknown, FrameworkOptions>>,
) {
  // each tool is run with `execute(input, { signal, callId, context, writer })`
}
```

A plain `StandardFunctionV1` accepts only functions that need nothing beyond the standard options, so a framework that provides nothing else types its functions that way. A framework that only describes functions without running them can accept every function, whatever it needs, as `StandardFunctionV1<any, unknown, never>`. `any` would accept them too, but it would also let you run them with any options, while `never` makes running them a type error.

### How do I infer the options needed to run several functions?

With `StandardFunctionV1.InferOptions`. For a union of functions, it infers the intersection of the options they need, so an agent can require exactly the context its tools need:

```ts
import type { StandardFunctionV1 } from "@standard-schema/spec";

type AnyFunction = StandardFunctionV1<any, unknown, never>;

function defineAgent<const Tools extends ReadonlyArray<AnyFunction>>(config: {
  tools: Tools;
  context: StandardFunctionV1.InferOptions<Tools[number]>["context"];
}) {
  // ...
}
```

Don't infer it with `function defineAgent<Options extends StandardFunctionV1.Options>(tools: StandardFunctionV1<any, unknown, Options>[])`: TypeScript infers `Options` from the first tool only, and then rejects the others.

### Why are the options of `execute` required?

So their type stays a plain parameter type, which keeps TypeScript's checks sound and its inference simple. Callers always pass an options object, even an empty one: `execute(input, {})`.

### Why are `signal` and `callId` standard options?

Every caller and every function can understand cancellation without agreeing on anything else, and `AbortSignal` is built into the platform. If each caller passed it under a key of its own choosing, a framework could only cancel functions that happened to use the same key. Like `fetch` and `addEventListener`, `execute` takes it as `signal` in an options object. A function that calls other functions or models should forward its `signal` to them.

The same goes for `callId`. Many callers identify each call, like a model's tool call or an RPC request, and a function can use the id to tie its logs, progress or side effects to the call without agreeing on a key name with each caller. Callers that have no id leave it out.

### Why is the context an option of its own?

A context usually lasts a whole request or run, while options like `signal` and `callId` can change with every call. Callers create new options for each call and put the context in them as-is, so a function receives the same object its caller holds, and the context's keys can't collide with the standard options or a framework's own.

### How does streaming work?

A function that can stream its results implements `executeStream`, which yields results of the same type as `execute`: each one is a value or a failure, and each value matches `jsonSchema.output`. What successive values mean is up to the function. They may be snapshots that replace each other, rows of a result set, or changes to a previous value. `execute` is always implemented, for callers that can't consume a stream.

```ts
import type { StandardFunctionV1 } from "@standard-schema/spec";

async function runStreaming(fn: StandardFunctionV1) {
  const { executeStream, execute } = fn["~standard"];
  if (!executeStream) return execute({}, {});
  for await (const result of executeStream({}, {})) {
    // show each result as it arrives
  }
}
```

### Why isn't a stream just an output of type `AsyncIterable`?

JSON Schema can't describe a stream, so `jsonSchema.output` couldn't describe the output. And many callers need a single result, like a model that receives one result per tool call. With `executeStream`, the same function can be called either way, and every result it yields is described by `jsonSchema.output`.

### How to only allow synchronous functions?

The `~standard.execute()` function might return a synchronous value _or_ a `Promise`. If you only accept synchronous functions, you can simply throw an error if it returns an instance of `Promise`.

```ts
import type { StandardFunctionV1 } from "@standard-schema/spec";

function runSync(fn: StandardFunctionV1, input: unknown) {
  const result = fn["~standard"].execute(input, {});
  if (result instanceof Promise) {
    throw new TypeError("Function must be synchronous");
  }
  // ...
}
```

### I'm a library author. How do I implement this spec?

Refer to the [implementation example](https://github.com/standard-schema/standard-schema/blob/main/packages/examples/function-implement.ts) for a worked example.

If your functions are built from schemas, `createStandardFunctionFactory` from [`@standard-schema/utils`](https://github.com/standard-schema/standard-schema/tree/main/packages/utils) implements the spec for you. It validates the input and output with the schemas and returns failures with the right `source`, and your users don't need to install anything else.

### I want to accept functions from a user. How do I do that?

Refer to the [integration example](https://github.com/standard-schema/standard-schema/blob/main/packages/examples/function-integrate.ts), which describes functions to a model as tools, runs the ones it calls and reports the results back to it.
