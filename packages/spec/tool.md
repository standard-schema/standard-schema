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

Standard Tool is a common interface designed to be implemented by JavaScript and TypeScript tools: functions that describe themselves, usually to an AI model, which can then call them.

The goal is to make it easier for frameworks to accept user-defined tools, without needing to write custom logic or adapters for each supported library. And since Standard Tool is a specification, they can do so with no additional runtime dependencies.

## Motivation

Many libraries run tools that their users define:

- AI SDKs that offer tools to a model and run the ones it calls
- Agent frameworks
- MCP servers, which expose tools to any MCP client

Each defines its own tool format, so a tool written for one can't be passed to another without an adapter. Standard Schema and Standard JSON Schema already let a framework validate and describe a tool's input without depending on the library that defined it. This spec covers the rest: a tool's name, its description, and a standard way to run it.

## The interface

The specification consists of a single TypeScript interface `StandardToolV1` to be implemented by any library wishing to be spec-compliant. A tool describes its input and output with `StandardJSONSchemaV1` schemas, and reports failures with the result of `StandardSchemaV1`.

This interface and the specs it builds on can be found below in their entirety. Libraries wishing to implement the spec can copy/paste the code block below into their codebase. It's also available at `@standard-schema/spec` on [npm](https://www.npmjs.com/package/@standard-schema/spec) and [JSR](https://jsr.io/@standard-schema/spec).

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
    /** Inferred types associated with this entity. */
    readonly types?: Types<Input, Output> | undefined;
  }

  /** The Standard Typed types interface. */
  export interface Types<Input = unknown, Output = Input> {
    /** The input type of this entity. */
    readonly input: Input;
    /** The output type of this entity. */
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
      options: StandardJSONSchemaV1.Options,
    ) => Record<string, unknown>;
    /** Converts the output type to JSON Schema. May throw if conversion is not supported. */
    readonly output: (
      options: StandardJSONSchemaV1.Options,
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
    extends StandardTypedV1.Props<Input, Output> {
    /** The name of the tool. Set to "" if it has none. */
    readonly name: string;
    /** A description of what the tool does. Set to "" if it has none. */
    readonly description: string;
    /** The schema of the tool's input, whose output type is the `Input` that `execute` takes. If it also implements Standard Schema, callers can validate with it. */
    readonly input: StandardJSONSchemaV1<unknown, Input>;
    /** The schema of the tool's output, if any, whose input type is the `Output` that `execute` resolves to. If it also implements Standard Schema, callers can validate with it. */
    readonly output?: StandardJSONSchemaV1<Output, unknown> | undefined;
    /**
     * Runs the tool. Does not validate: the caller must pass an input matching `Input`, like the `value` returned by the `input` schema's `validate`.
     *
     * Resolves to the output, or to a failure the tool chose to report, which is safe to show a model. Rejects if something unexpected happens, and the error may contain internal details.
     */
    readonly execute: (
      input: Input,
      ...options: ExecuteOptions<Context>
    ) => Promise<StandardSchemaV1.Result<Output>>;
  }

  /** The type of a tool's `execute` function. */
  export type ExecuteFunction<
    Input = any,
    Output = unknown,
    Context = unknown,
  > = Props<Input, Output, Context>["execute"];

  /** A Standard Tool whose `input` also implements Standard Schema, so a caller can validate input with it before calling `execute`. */
  export type Validatable<
    Input = any,
    Output = unknown,
    Context = unknown,
  > = StandardToolV1<Input, Output, Context> & {
    readonly "~standard": {
      readonly input: StandardSchemaV1<unknown, Input>;
    };
  };

  /** The options callers pass as the second argument of `execute`. */
  export interface Options<Context = unknown> {
    /** Aborted when the caller no longer needs the result, so the tool can stop its work early. */
    readonly signal?: AbortSignal | undefined;
    /** The identifier of the call, such as the id a model assigned to it. Omitted if the caller has none. */
    readonly callId?: string | undefined;
    /** What the tool needs from its caller to run, like a database client or the current user. Callers pass their own object as-is. */
    readonly context?: Context | undefined;
  }

  /** The parameters of `execute` after `input`: an options object, required along with its `context` unless `Context` includes `undefined`. */
  export type ExecuteOptions<Context = unknown> = undefined extends Context
    ? [options?: Options<Context> | undefined]
    : [options: Options<Context> & { readonly context: Context }];

  /** The environment's built-in `AbortSignal` type, or `any` if it can't be detected. */
  export type AbortSignal = typeof globalThis extends {
    AbortSignal: { prototype: infer Signal };
  }
    ? Signal
    : any;

  /** The Standard Tool types interface. */
  export interface Types<Input = unknown, Output = unknown>
    extends StandardTypedV1.Types<Input, Output> {}

  /** Infers the input type of a Standard Tool: what `execute` takes, which is the output type of its `input` schema. */
  export type InferInput<Tool extends StandardToolV1<any, unknown, never>> =
    Tool extends StandardToolV1<infer Input, unknown, never> ? Input : never;

  /** Infers the output type of a Standard Tool: what `execute` resolves to, which is the input type of its `output` schema. */
  export type InferOutput<Tool extends StandardToolV1<any, unknown, never>> =
    Tool extends StandardToolV1<any, infer Output, never> ? Output : never;

  /** Infers the context type of a Standard Tool. For a union of tools, infers the context needed to run all of them. */
  export type InferContext<Tool extends StandardToolV1<any, unknown, never>> = (
    Tool extends StandardToolV1<any, unknown, infer Context>
      ? (context: Context) => void
      : never
  ) extends (context: infer Context) => void
    ? Context
    : never;
}
```

## How does it work?

A framework describes a tool to a model with its `name`, its `description` and the JSON Schema of its `input`. When the model calls the tool, the framework:

1. Validates the arguments, usually with `input["~standard"].validate`. If they're invalid, the tool hasn't run, so the framework reports the issues and lets the model try again.
2. Calls `execute` with the validated value, along with a `signal`, the call's `callId` and a `context`.
3. Reports the result. A returned failure is one the tool chose to report, so it's safe to show the model. A rejection is unexpected and may contain internal details, so whether to show it is the framework's decision.

Validating and running are separate calls, so a framework always knows which one failed.

## Design goals

The specification meets a few primary design objectives:

- **Support tool calling.** Given a Standard Tool, you should be able to describe it to a model with its name, description and input JSON Schema, and run it with the arguments the model produces.
- **Compose with validation.** `execute` doesn't validate. Validation already has a standard, so a framework that needs it accepts `StandardToolV1.Validatable` and validates once, before the tool runs.
- **Report failures the caller can act on.** A tool returns failures it wants its caller to see, with the same result as Standard Schema, and rejects for anything unexpected.
- **Support cancellation.** Callers can pass an `AbortSignal` to `execute`, so a tool can stop its work early once its result is no longer needed.
- **Support caller context.** A tool can declare a `Context` it needs from its caller, like a database client or the current user, and callers pass it to `execute`. A tool needing a context its caller doesn't provide is a type error, not a crash at runtime.
- **Support static type inference.** For TypeScript libraries that do type inference, the specification provides a standard way for them to "advertise" a tool's input, output and context types, so they can be extracted and used by frameworks.
- **Minimal.** It should be easy for libraries to implement this spec in a few lines of code that call their existing functions/methods.
- **Avoid API conflicts.** The entire spec is tucked inside a single object property called `~standard`, which avoids potential naming conflicts with the API surface of existing libraries.
- **Do no harm to DX.** The `~standard` property is tilde-prefixed to [de-prioritize it in autocompletion](https://x.com/colinhacks/status/1816860780459073933). By contrast, an underscore-prefixed property would show up before properties/methods with alphanumeric names.

## What libraries implement the spec?

These are the libraries that have already implemented the Standard Tool interface. (If you maintain a library that implements the spec, [create a PR](https://github.com/standard-schema/standard-schema/compare) to add yourself!)

| Implementer | Version(s) | Link |
| ----------- | ---------- | ---- |

## What frameworks accept spec-compliant tools?

The following frameworks accept user-defined tools conforming to the Standard Tool spec. If you maintain a framework that supports Standard Tools, [create a PR](https://github.com/standard-schema/standard-schema/compare) to add yourself!

When creating a PR to add your framework, please add a new row to the table below with:

- **Integrator**: The name of your framework (as a link to your project)
- **Description**: A brief description of your framework. Should be a sentence fragment with no period at the end, e.g. ("Type-safe agent framework for TypeScript")
- **Link**: A link to PR/commit where support was merged.

| Integrator | Description | Link |
| ---------- | ----------- | ---- |

## FAQ

These are the most frequently asked questions about Standard Tool. Questions that apply to every spec, like whether to depend on `@standard-schema/spec`, are answered in the [Standard Schema FAQ](https://standardschema.dev/schema#faq). If your question is not listed, feel free to create an issue.

### What's the relationship between this and _Standard Schema_?

Standard Tool builds on Standard Schema and Standard JSON Schema rather than extending either, and shares their `StandardTypedV1` base. A tool's `input` and `output` are Standard JSON Schemas, which can also implement Standard Schema so a caller can validate with them, and `execute` resolves to the same result as Standard Schema's `validate`. A tool isn't a schema itself: it leaves validation to Standard Schema.

### Is Standard Tool only for AI models?

No. It's designed around tool calling, but nothing in the interface depends on a model: an agent, an RPC procedure or any other function with one described input can implement it, and any code can run it. It's called a tool because its shape is narrower than a function's: one input with an introspectable schema, a name and a description.

### Who validates a tool's input?

Its caller. `execute` doesn't validate, so callers must pass input matching `Input`, using a validator if the value isn't already known to match. Arguments from a model aren't, so a framework that takes them accepts `StandardToolV1.Validatable`, a tool whose `input` also implements Standard Schema, and validates before running it:

```ts
import type { StandardToolV1 } from "@standard-schema/spec";

async function runTool<Input, Output>(
  tool: StandardToolV1.Validatable<Input, Output>,
  args: unknown,
) {
  const { input, execute } = tool["~standard"];
  const parsed = await input["~standard"].validate(args);
  // the tool didn't run, so the model can fix its arguments and try again
  if (parsed.issues) return { ran: false, result: parsed };
  return { ran: true, result: await execute(parsed.value) };
}
```

Checking arguments against the input JSON Schema, or a model provider's constrained decoding, is only enough when the schema has no transforms or defaults and no checks JSON Schema can't express.

Validating outside `execute` lets a framework check a call before running it: to ask a user for approval, to repair invalid arguments, or to let the model fix them without running anything. Frameworks that already validate before calling a handler, like the AI SDK and the MCP SDK, keep that step, so nothing is validated twice, and schemas that transform their input just work, since `execute` receives the parsed value.

Zod (4.2+) and ArkType (2.1.28+) schemas implement both specs, as do Valibot schemas wrapped with `toStandardJsonSchema()` from `@valibot/to-json-schema` and Zod Mini schemas converted with `z.toJSONSchema()` (see [the full list](https://standardschema.dev/json-schema#what-schema-libraries-support-this-spec)), so any of them can be passed as a tool's `input`.

### Why doesn't `input` have to implement Standard Schema?

Not every tool has a validator, and not everything that uses a tool needs one. A tool built from a JSON Schema alone, like one generated from an OpenAPI operation, would have to bundle a JSON Schema validator, or fake a `validate` that claims a typed `Input` it never checks. Typed code that already holds an `Input`, and a framework that only describes tools, never call `validate`. So the requirement sits with the framework that needs it, which accepts `StandardToolV1.Validatable`, and a tool it can't validate is a type error there rather than an unchecked call. Every framework that runs a model's calls needs exactly that type, so the spec exports it, unlike the combinations of schema specs that Standard JSON Schema leaves to you.

A tool can still check its input itself, like a proxy to a remote MCP server that validates on its own, but callers can't rely on it. Such a tool types `Input` as `unknown`, so any value satisfies `execute`, and its `input` can implement Standard Schema with a `validate` that returns every value as-is, which is truthful since its `Input` is `unknown`, so frameworks that validate accept it too.

The cost: typing a tool as a plain `StandardToolV1` widens its `input` to Standard JSON Schema, so a framework that validates rejects it. A library that creates tools returns `StandardToolV1.Validatable` when its schemas implement Standard Schema, as the [implementation example](https://github.com/standard-schema/standard-schema/blob/main/packages/examples/tool-implement.ts) does, and a hand-written tool uses `satisfies`.

### How do I write a tool by hand?

Write the `~standard` property yourself, and check it with `satisfies` rather than a type annotation, so the tool keeps its schema's type:

```ts
import type { StandardToolV1 } from "@standard-schema/spec";
import * as z from "zod";

const input = z.object({ city: z.string() });

export const getWeather = {
  "~standard": {
    version: 1,
    vendor: "my-app",
    name: "get_weather",
    description: "Get the current temperature in a city, in degrees Celsius",
    input,
    async execute({ city }) {
      return { value: { temperature: await getTemperature(city) } };
    },
  },
} satisfies StandardToolV1<z.output<typeof input>, { temperature: number }>;
```

### Does a tool behave the same in every framework?

Given the same `Input` and `Context`, yes: `execute` is the tool's whole behavior, and a framework only decides how it gets an `Input`. Every framework that validates with the tool's own `input` schema passes it the same value, transforms and defaults included.

### Why does `Input` default to `any`?

`execute` takes `Input` as a parameter, so `StandardToolV1<unknown>` would reject every tool with a specific input, like `{ city: string }`. With `any`, a plain `StandardToolV1` accepts them all. The cost is that TypeScript doesn't check what a framework passes to such a tool's `execute`, so it must pass a value known to match, like the `value` the tool's own `input` schema returned from `validate`.

### Why do `input` and `output` have their own schemas?

So a framework can validate each of them. A tool could instead extend Standard JSON Schema and describe both sides with `jsonSchema.input` and `jsonSchema.output`, but an object has only one `validate` and one set of inferred types, so only one side could be validated. Separate slots also let a library pass a user's existing schemas as they are.

`input` is required so the tool, not each framework, decides what it takes: if it were optional, every framework would invent its own schema to describe the missing one, and its own value to pass to `execute`. A tool with no arguments uses an empty object schema. `output` is optional because a model doesn't need it to call the tool.

### What about validating a tool's output?

Output comes from the tool's own code, so most tools don't need a framework to check it. A tool can validate inside `execute`, or a framework can validate with `output` when it also implements Standard Schema, checking for `validate` at runtime, since `output` is typed only as Standard JSON Schema. An invalid output is a bug in the tool that a model can't fix, and the tool has already run and may have had side effects, so treat it like a rejection rather than letting the model retry.

### What are the `Input` and `Output` of a tool?

The types `execute` takes and resolves to, which is also what `InferInput` and `InferOutput` give. Unlike the other specs' helpers, they're inferred from the tool's shape rather than its `types`, which most tools leave out. If a schema transforms its value, they differ from the arguments a model sends and the result it receives:

```text
model arguments -> input schema -> Input -> execute -> Output -> output schema, if applied -> model
```

Describe a tool's arguments with `input["~standard"].jsonSchema.input(options)`. Describe its result with `output["~standard"].jsonSchema.output(options)` if the framework passes it through the output schema, or with `jsonSchema.input(options)` if it sends `Output` as-is.

### What if a tool's input isn't an object?

A tool's input can be any type, like a string or an array, but model providers and MCP require a tool's input schema to have `type: "object"`. A framework that can't accept a non-object input should throw a descriptive error when the tool is registered, rather than wrapping the input in an object of its own.

### Why are `name` and `description` required?

So a library that adopts the spec can't drop them by accident, and frameworks always read a string, never `undefined`. A tool without one sets it to `""`. Many libraries name tools by the key they're registered under, so a framework whose model provider requires a name can fall back to that key with `name || key`, as the [integration example](https://github.com/standard-schema/standard-schema/blob/main/packages/examples/tool-integrate.ts) does.

### Why does `execute` return a result instead of its output?

So a framework can tell a failure the tool means its caller to see, like a declined payment, from an unexpected error that may contain internal details, without knowing anything about the tool. If tools only threw, a framework couldn't recognize another library's error classes, so it would have to show a model every error or none. If a failure were part of `Output`, a framework couldn't tell it from success. The result is Standard Schema's, so a framework reports a tool's failures the same way it reports invalid input.

The cost is that code calling a tool directly checks `issues` and reads `value`, as it does after `validate`. Resolving to the output itself, with a failure marked by a reserved key, would save that step, but the output would have to be an object that never uses the key, and TypeScript adds the key to an output returned beside a failure, so every library would need a type to remove it.

### What should a framework do when `execute` rejects?

That's the framework's decision. Many frameworks show a thrown error's message to the model today and can keep doing so, so a tool adapted from an existing library with `async (input) => ({ value: await fn(input) })` behaves as it did. A framework that hides rejections, since their messages may contain internal details, still shows returned failures, so a tool that wants a failure seen in every framework returns it.

### How do issue paths work in a tool's failures?

A `path` in a failure that `execute` returns is relative to the input it received. That's the value the `input` schema produced, so if the schema transforms, the path may not exist in the arguments a model sent. Most failures a tool returns are about the call as a whole, like a declined payment, and leave `path` out. A tool that runs another tool, like an agent, shouldn't return the inner tool's failure as its own, since its paths would point into the wrong input.

### Why is `execute` always async?

Unlike `validate`, which is often synchronous, a tool nearly always does I/O, so `execute` always returns a `Promise` and callers handle one case. Any function, sync or async, becomes an `execute` with `async (input) => ({ value: await fn(input) })`.

### How does a tool get what it needs from its caller?

Through its `Context`, the third type parameter. A tool that needs a database client declares `StandardToolV1<Input, Output, { db: Db }>`, and callers must call `execute(input, { context: { db } })`. A tool that needs nothing leaves `Context` as `unknown`, so any caller can run it. Don't use `undefined` or `void` for that: they mean the tool accepts only `undefined`, so a framework that provides a context rejects it.

A framework that provides a context types its tools with it, as in `StandardToolV1.Validatable<any, unknown, { db: Db; userId: string }>`, so a tool needing more than the framework provides is rejected at compile time.

A framework that provides no context types its tools with `undefined`, as in `StandardToolV1<any, unknown, undefined>`, which accepts every tool whose `Context` includes `undefined`. A plain `StandardToolV1` can be run with any context, so it accepts only tools whose `Context` is `unknown`. A framework that only describes tools can accept every tool as `StandardToolV1<any, unknown, never>`: no value is a `never`, so unlike with `any`, none can be run without its context.

Callers pass their context object as-is, so a tool receives the same object its caller holds. The spec's own options sit beside `context` rather than inside it: a context usually lasts a whole request or run, while `signal` and `callId` change with every call, and no key a tool chooses for its context can collide with them. A tool that calls other tools, models or APIs should forward its `signal` to them.

### When are the options of `execute` required?

When the tool requires a context, meaning its `Context` doesn't include `undefined`. Every other tool runs with just its input:

```ts
needsDb["~standard"].execute(input); // error: the context is required
needsDb["~standard"].execute(input, { context: { db } }); // ok
needsNothing["~standard"].execute(input); // ok
```

If the options were always optional, a tool that needs a context could be run without one. If they were always required, every caller would pass `{}` to tools that need nothing. The cost is a conditional parameter type: code generic over `Context` can't tell yet whether the options are required, so it implements `execute` as `(input, options?) => ...`, or forwards them with `(input, ...options) => tool["~standard"].execute(input, ...options)`.

### How do I infer the context needed to run several tools?

With `StandardToolV1.InferContext`. For a union of tools, it infers the intersection of the contexts they need, not their union, so an agent requires everything its tools need rather than what any one of them needs:

```ts
import type { StandardToolV1 } from "@standard-schema/spec";

type AgentConfig<
  Tools extends ReadonlyArray<StandardToolV1<any, unknown, never>>,
> = {
  tools: Tools;
  context: StandardToolV1.InferContext<Tools[number]>;
};

function defineAgent<
  const Tools extends ReadonlyArray<StandardToolV1<any, unknown, never>>,
>(config: AgentConfig<Tools>) {
  // ...
}
```

Don't infer the context with a type parameter of its own from the tools alone, as in `function defineAgent<Context>(tools: ReadonlyArray<StandardToolV1<any, unknown, Context>>)`: TypeScript infers `Context` from one of the tools rather than combining them, and then rejects the others.

A framework that takes its context beside the tools, as in `run<Context>(tools, context: Context)`, types the tools with `NoInfer<Context>` so the context alone decides `Context`. Otherwise a tool that needs no context can make it `unknown`, and the tools that need one are rejected.

If two tools need different types for the same key, like `{ userId: string }` and `{ userId: number }`, the intersection's `userId` is `never`, so a framework with one context shared by every tool can't run both. One that keys contexts by tool name can; otherwise, wrap one of the tools so it reads the value from a different key.

### Why is there no streaming or approval?

To keep V1 minimal. Approval is the caller's decision: it validates the input, asks for approval, then calls `execute`, so a tool needs no field for it, and a library's own approval setting can sit beside `~standard`. Streaming can be added later as an optional method without breaking existing tools. Until then, a tool that produces results as it goes returns its final result. A tool can declare a progress writer in its `Context`, but then it only runs in frameworks that provide one.

### I'm a library author. How do I implement this spec?

Refer to the [implementation example](https://github.com/standard-schema/standard-schema/blob/main/packages/examples/tool-implement.ts) for a worked example. There's no helper package: since `execute` doesn't validate, `~standard` is a plain object of things your tool already has. If your library already has a `tool` function, add `~standard` to the tools it returns and map `signal`, `callId` and `context` onto your handler's own options, as the [extension example](https://github.com/standard-schema/standard-schema/blob/main/packages/examples/tool-extend.ts) shows, so your users' tools become Standard Tools without changes.

If your function infers a tool's output from a handler, a handler that returns `{ value }` and `{ issues }` as two object literals infers `Output | undefined` unless `exactOptionalPropertyTypes` is on, because TypeScript adds `value?: undefined` to the failure. Annotating the handler's return type as `Promise<StandardSchemaV1.Result<Output>>` avoids it.

If your tools validate their own input, `~standard.execute` calls the handler that runs after that step, not the validating one: it receives the parsed value, and validating that again as if it were raw input fails when the schema transforms.

If your users' tools throw for failures a model should see, your `execute` can't tell those from bugs, so they become rejections, which some frameworks don't show a model. Give your users a way to report them everywhere, like an error class your `execute` catches and returns as `{ issues }`.

### I want to accept tools from a user. How do I do that?

Refer to the [integration example](https://github.com/standard-schema/standard-schema/blob/main/packages/examples/tool-integrate.ts), which describes tools to a model, validates the arguments of the tools the model calls, runs them and reports the results back to it.
