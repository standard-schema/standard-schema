<h1 align="center">
  <img alt="Standard Schema fire logo" loading="lazy" width="50" height="50" decoding="async" data-nimg="1" style="color:transparent" src="https://standardschema.dev/favicon.svg">
  </br>
  Standard Tool</h1>
<p align="center">
  A common interface for self-describing, executable tools
  <br/>
  <a href="https://standardschema.dev/tool">standardschema.dev/tool</a>
</p>
<br/>

<!-- start -->

Standard Tool is a common interface designed to be implemented by JavaScript and TypeScript tools that describe themselves with a name, a description and schemas for their input and output.

The goal is to make it easier for AI libraries and other frameworks to accept user-defined tools without needing to write custom logic or adapters for each supported library. And since Standard Tool is a specification, they can do so with no additional runtime dependencies.

## Motivation

Many libraries need to execute functions they did not define, and need to know what those functions expect and return:

- Tools that AI models can call
- Procedures of RPC frameworks
- Commands of CLIs
- Steps of workflows and jobs of queues
- Dynamic parts of a system prompt

Today, every AI library defines its own tool format, so a tool written for one library can't be used with another. Standard Tool provides a single format that every library can accept.

## The interface

The specification consists of a single TypeScript interface `StandardToolV1` to be implemented by any library wishing to be spec-compliant. It is modeled after [Standard Schema](https://standardschema.dev/schema): where a schema has `validate`, a tool has `execute`, and both return a `{ value }` or `{ issues }` result. It builds on Standard Schema and [Standard JSON Schema](https://standardschema.dev/json-schema), which are both required to copy/paste the code block below into your codebase. Everything is also available at `@standard-schema/spec` on [npm](https://www.npmjs.com/package/@standard-schema/spec) and [JSR](https://jsr.io/@standard-schema/spec).

```ts
/** The Standard Tool interface. */
export interface StandardToolV1<
  Input = unknown,
  Output = unknown,
  Context = unknown,
> {
  /** The Standard Tool properties. */
  readonly "~standard": StandardToolV1.Props<Input, Output, Context>;
}

export declare namespace StandardToolV1 {
  /** The Standard Tool properties interface. */
  export interface Props<Input = unknown, Output = unknown, Context = unknown>
    extends StandardTypedV1.Props<Input, Output> {
    /** The name of the tool, if any. */
    readonly name?: string | undefined;
    /** The description of the tool, if any. */
    readonly description?: string | undefined;
    /** The JSON Schema of the input, if any. */
    readonly input?: StandardJSONSchemaV1<Input, unknown> | undefined;
    /** The JSON Schema of the output, if any. */
    readonly output?: StandardJSONSchemaV1<unknown, Output> | undefined;
    /** Validates the input, executes the tool and validates its output. */
    readonly execute: (
      value: unknown,
      options?: StandardToolV1.Options<Context> | undefined,
    ) => Result<Output> | Promise<Result<Output>>;
  }

  /** The result interface of the execute function. */
  export type Result<Output> = SuccessResult<Output> | FailureResult;

  /** The result interface if execution succeeds. */
  export type SuccessResult<Output> = StandardSchemaV1.SuccessResult<Output>;

  /** The result interface if the input or output is invalid. */
  export interface FailureResult extends StandardSchemaV1.FailureResult {
    /** The source of the issues: the input or the output. */
    readonly source: "input" | "output";
  }

  /** The options interface of the execute function. */
  export interface Options<Context = unknown> {
    /** The signal to abort the execution, if any. */
    readonly signal?: AbortSignal | undefined;
    /** The identifier of the call, if any. */
    readonly callId?: string | undefined;
    /** The context of the application, if any. */
    readonly context?: Context | undefined;
  }

  /** The built-in `AbortSignal` type, or `unknown` if it is not available. */
  export type AbortSignal = typeof globalThis extends {
    AbortSignal: { prototype: infer Signal };
  }
    ? Signal
    : unknown;

  /** The Standard Tool types interface. */
  export interface Types<Input = unknown, Output = unknown>
    extends StandardTypedV1.Types<Input, Output> {}

  /** Infers the input type of a Standard Tool. */
  export type InferInput<Tool extends StandardTypedV1> =
    StandardTypedV1.InferInput<Tool>;

  /** Infers the output type of a Standard Tool. */
  export type InferOutput<Tool extends StandardTypedV1> =
    StandardTypedV1.InferOutput<Tool>;

  /** Infers the context type of a Standard Tool. */
  export type InferContext<
    Tool extends StandardToolV1<unknown, unknown, never>,
  > =
    Tool extends StandardToolV1<unknown, unknown, infer Context>
      ? Context
      : unknown;
}
```

## How does it work?

A Standard Tool validates its own input and output, just like a Standard Schema validates its input. Libraries that execute a tool pass the raw input to `execute` and must not validate it themselves. This way, every value is validated exactly once and a tool behaves the same in every library.

Calling `execute` must:

1. Validate the input. If it is invalid, return its issues with the source `"input"` without running the tool.
2. Run the tool with the validated input.
3. Validate the output. If it is invalid, return its issues with the source `"output"`.
4. Return the validated output as `value`.

If the tool fails for any other reason, `execute` throws. `execute` must only rely on what the spec passes to it, so that the tool works in every library.

Tools are rarely implemented by hand. AI libraries [add the `~standard` property to their existing tools](#im-an-ai-library-author-how-do-i-add-the-spec-to-my-existing-tool-function) with `createStandardToolFactory` from `@standard-schema/utils`, which implements these steps.

## Design goals

The specification meets a few primary design objectives:

- **Same as Standard Schema.** `execute` takes an unknown value and returns `{ value }` or `{ issues }`, like `validate`. Libraries that support Standard Schema already know how to handle the result.
- **Validate exactly once.** The tool validates its own input and output, and its caller never does. Invalid input never reaches the tool, and invalid output never reaches the caller.
- **Works across libraries.** A tool created with one AI library can be executed by any other library that supports the spec.
- **Not limited to AI.** Tool calling is the main use case, but the spec makes no assumptions about who executes a tool or why.
- **Support cancellation and context.** Callers can pass an `AbortSignal`, a call identifier and a typed context of the application, like a database client or the current user.
- **Support static type inference.** The specification provides a standard way to "advertise" a tool's input, output and context types.
- **Avoid API conflicts.** The entire spec is tucked inside a single object property called `~standard`, which avoids potential naming conflicts with the API surface of existing libraries.

## FAQ

These are the most frequently asked questions about Standard Tool. If your question is not listed, feel free to create an issue.

### How do I create a Standard Tool?

Use the tool function of your AI library, as usual. If your library supports the spec, its tools are Standard Tools and can be executed by any other library that supports the spec.

If your library doesn't support the spec yet, use `createStandardTool` from `@standard-schema/utils`. It accepts schemas of any library that implement both Standard Schema and Standard JSON Schema, and infers the types of the tool from them.

```ts
import { createStandardTool } from "@standard-schema/utils";
import { toStandardJsonSchema } from "@valibot/to-json-schema";
import * as v from "valibot";
import * as z from "zod";

export const getWeather = createStandardTool({
  name: "get_weather",
  description: "Get the current temperature in a city, in degrees Celsius",
  input: z.object({ city: z.string() }),
  output: toStandardJsonSchema(
    v.object({ city: v.string(), temperature: v.number() }),
  ),
  async execute({ city }, { signal }) {
    const response = await fetch(`https://example.com/weather/${city}`, {
      signal,
    });
    const { temperature } = await response.json();
    return { city, temperature };
  },
});
```

### I'm an AI library author. How do I add the spec to my existing tool function?

Just like schema libraries add the `~standard` property to their schemas, add it to the tools returned by your existing function. Your API stays the same, existing tools become Standard Tools without any changes by your users, and your own features, like approval, stay next to `~standard`. Other libraries ignore them.

`createStandardToolFactory` from `@standard-schema/utils` creates the `~standard` property and implements the validation [described above](#how-does-it-work). Map the options of the spec to the options of your API:

```ts
import { createStandardToolFactory } from "@standard-schema/utils";

const createStandardTool = createStandardToolFactory("my-ai-lib");

export function tool(config) {
  const standardTool = createStandardTool({
    description: config.description,
    input: config.inputSchema,
    // map the options of the spec to the options of your API
    execute: (input, options) =>
      config.execute(input, {
        toolCallId: options.callId ?? "",
        abortSignal: options.signal,
        context: options.context,
      }),
  });
  return { ...config, ...standardTool };
}
```

Features that only your library provides, like suspending a tool or streaming its progress, can't be part of `~standard.execute`. Make them optional there, or fail with a clear error, so the tool still works in other libraries. Refer to the [extension example](https://github.com/standard-schema/standard-schema/blob/main/packages/examples/tool-extend.ts) for a fully typed version.

### I'm an AI library author. Can I export `createStandardTool` instead?

Yes, if your library doesn't have its own tool function yet. Pass its name to `createStandardToolFactory` and export the returned function, so your users don't need to install anything else.

```ts
import { createStandardToolFactory } from "@standard-schema/utils";

export const createStandardTool = createStandardToolFactory("my-ai-lib");
```

If your library already has a tool function, prefer [adding the spec to it](#im-an-ai-library-author-how-do-i-add-the-spec-to-my-existing-tool-function), so your users don't have to choose between two ways of creating tools. Refer to the [implementation example](https://github.com/standard-schema/standard-schema/blob/main/packages/examples/tool-implement.ts) for a worked example.

### I'm an AI library author. How do I execute Standard Tools?

Pass the raw input to `execute`, without validating it, and handle the result like the result of a Standard Schema.

If the input is invalid, the tool did not run. Don't throw an error in this case, since this usually ends the run or hides the issues from the model. Instead, send the issues back to the model as the result of the tool call. Each issue has a message and a path to the invalid value, so the model can fix its input and call the tool again. If the output is invalid, the tool already ran, so report the error instead of letting the model retry it.

```ts
import type { StandardToolV1 } from "@standard-schema/spec";

async function executeToolCall(tool: StandardToolV1, input: unknown) {
  const result = await tool["~standard"].execute(input);
  if (result.issues) {
    // don't throw: return the issues to the model, so it can react to them
    return {
      isError: true,
      content:
        result.source === "input"
          ? // the tool did not run, so the model can fix its input and retry
            `Invalid input, fix it and try again: ${JSON.stringify(result.issues)}`
          : // the tool already ran, so it should not simply be retried
            "The tool returned an invalid output",
    };
  }
  return { isError: false, content: JSON.stringify(result.value) };
}
```

Refer to the [integration example](https://github.com/standard-schema/standard-schema/blob/main/packages/examples/tool-integrate.ts) for a worked example, including thrown errors.

### What about error handling?

If the input or output is invalid, `execute` returns Standard Schema issues together with a `source`:

- `"input"`: The input is invalid and the tool did not run. The caller can correct the input and execute the tool again, e.g. by sending the issues back to the model.
- `"output"`: The tool ran, but its output is invalid. Since the tool may already have caused side effects, it is not always safe to execute it again.

If the tool fails for any other reason, e.g. because a network request failed, `execute` throws.

### How do I describe a tool to an AI model?

Use `name`, `description` and the JSON Schema of `input`. Most model providers require a top-level object schema and a name that matches `^[a-zA-Z0-9_-]{1,64}$`, so use an empty object schema if `input` is omitted and fall back to a name of your own if `name` is missing.

```ts
import type { StandardToolV1 } from "@standard-schema/spec";

function describeTool(
  tool: StandardToolV1<unknown, unknown, never>,
  name: string,
) {
  const { input, description } = tool["~standard"];
  return {
    name: tool["~standard"].name ?? name,
    description: description ?? "",
    input_schema: input
      ? input["~standard"].jsonSchema.input({ target: "draft-07" })
      : { type: "object", properties: {} },
  };
}
```

The JSON Schema of the output is `output["~standard"].jsonSchema.output(options)`.

### How does a tool get what it needs from its caller?

Through its context, the third type parameter. A tool that needs a database client is a `StandardToolV1<Input, Output, { db: Db }>`, and callers pass it with `execute(input, { context: { db } })`.

To keep tools compatible with every library, the context follows three rules:

1. The application provides the context, not the library. It contains the dependencies of the application, like a database client or the current user.
2. Libraries that execute tools pass the context of the application unchanged and don't add their own objects to it.
3. `~standard.execute` only relies on the input, `signal`, `callId` and `context`. Features of a specific library are not part of the context.

A library declares the type of the context it passes to its tools in the same way. A tool that needs more than that is rejected at compile time:

```ts
import type { StandardToolV1 } from "@standard-schema/spec";

interface RequestContext {
  db: Db;
  userId: string;
}

function registerTools(
  tools: ReadonlyArray<StandardToolV1<unknown, unknown, RequestContext>>,
) {
  // each tool is executed with `{ context: requestContext }`
}
```

A plain `StandardToolV1` only accepts tools that need no context. Use `StandardToolV1<unknown, unknown, undefined>` to also accept tools whose context is optional, and `StandardToolV1<unknown, unknown, never>` to accept every tool without executing it, e.g. to describe it.

### Which packages do I need?

To execute tools, none. The `@standard-schema/spec` package only contains types, so you can also copy and paste them into your project. To add the spec to your tools, your AI library can depend on `@standard-schema/utils`, and its users don't need to install anything. If you prefer no additional dependency, you can also implement `~standard` yourself by following the steps [described above](#how-does-it-work). The [source of `createStandardToolFactory`](https://github.com/standard-schema/standard-schema/blob/main/packages/utils/src/createStandardToolFactory/createStandardToolFactory.ts) is only a few lines of code and can serve as a reference.

### Why does the tool validate its own input and output?

So that every library gets the same validation and the same result from every tool, without implementing validation itself. Since AI libraries usually implement the spec with `createStandardToolFactory`, the validation is implemented and tested once.

### Why do `input` and `output` only require Standard JSON Schema?

Because callers only use them to describe the tool. Validation happens inside the tool, so the spec doesn't need to know how it is done. This also allows tools that are validated elsewhere, like a tool of a remote server.

### Why is the `name` optional?

Many libraries name tools themselves, for example with the key of a record or the path of a file. If both exist, the library decides which one to use.

### Why is there no streaming or approval?

To keep the spec minimal. Approval is a decision of the caller, which can make it before calling `execute`. Streaming may be added in a future version.

### How to only allow synchronous tools?

The `~standard.execute()` function might return a synchronous value _or_ a `Promise`. If you only accept synchronous tools, you can simply throw an error if it returns an instance of `Promise`.

```ts
import type { StandardToolV1 } from "@standard-schema/spec";

function executeToolSync(tool: StandardToolV1, input: unknown) {
  const result = tool["~standard"].execute(input);
  if (result instanceof Promise) {
    throw new TypeError("Tool execution must be synchronous");
  }
  // ...
}
```
