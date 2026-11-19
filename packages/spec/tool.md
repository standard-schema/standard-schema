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

The specification consists of a single TypeScript interface `StandardToolV1` to be implemented by any library wishing to be spec-compliant. A tool has a fully typed `execute` function and describes its input and output with schemas that implement both [Standard Schema](https://standardschema.dev/schema) and [Standard JSON Schema](https://standardschema.dev/json-schema), which are both required to copy/paste the code block below into your codebase. Everything is also available at `@standard-schema/spec` on [npm](https://www.npmjs.com/package/@standard-schema/spec) and [JSR](https://jsr.io/@standard-schema/spec).

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
    /** The schema of the input, if any. Its output is the input of `execute`. */
    readonly input?: Schema<unknown, Input> | undefined;
    /** The schema of the output, if any. Its input is the output of `execute`. */
    readonly output?: Schema<Output, unknown> | undefined;
    /** Executes the tool with a valid input and returns its output. */
    readonly execute: (
      input: Input,
      options?: StandardToolV1.Options<Context> | undefined,
    ) => Output | Promise<Output>;
  }

  /** The schema interface of the input and output. */
  export type Schema<Input = unknown, Output = Input> = StandardSchemaV1<
    Input,
    Output
  > &
    StandardJSONSchemaV1<Input, Output>;

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

  /** Infers the input type of the execute function of a Standard Tool. */
  export type InferInput<Tool extends StandardTypedV1> =
    StandardTypedV1.InferInput<Tool>;

  /** Infers the output type of the execute function of a Standard Tool. */
  export type InferOutput<Tool extends StandardTypedV1> =
    StandardTypedV1.InferOutput<Tool>;

  /** Infers the context type of a Standard Tool. */
  export type InferContext<Tool extends StandardTypedV1> =
    Tool extends StandardToolV1<infer _Input, infer _Output, infer Context>
      ? Context
      : unknown;
}
```

## How does it work?

A Standard Tool doesn't validate anything itself. Its `execute` function is fully typed and only does the actual work: it takes the output of the `input` schema and returns the input of the `output` schema. Both schemas implement Standard Schema and Standard JSON Schema, so the caller can use their JSON Schema to describe the tool and their `validate` function to validate its input and output.

```
raw input ──▶ input.validate() ──▶ execute() ──▶ output.validate() ──▶ output
```

The caller decides if, when and how it validates. A library that executes a tool with an untrusted input, like a tool call of a model, should:

1. Validate the input with `input`. If it is invalid, don't run the tool and handle the issues, e.g. by sending them back to the model.
2. Execute the tool with the `value` of the validation result.
3. Validate the returned value with `output`, if it needs a valid output, and use the `value` of the validation result.

Typed code that already has a valid input can call `execute` directly. If `input` is omitted, `execute` must accept any value. If `output` is omitted, the tool doesn't describe its output.

If the tool fails, `execute` throws. `execute` must only rely on what the spec passes to it, so that the tool works in every library.

## Design goals

The specification meets a few primary design objectives:

- **Fully typed execution.** `execute` takes the typed input and returns the typed output of the tool, without a result object. Typed code can call it directly.
- **The caller is in control.** The tool provides everything needed to validate its input and output, but doesn't validate them itself. The caller decides if, when and how it validates and how it handles issues.
- **Built on existing specs.** The input and output are described with Standard Schema and Standard JSON Schema, so existing schemas can be passed as they are.
- **Works across libraries.** A tool created with one AI library can be executed by any other library that supports the spec.
- **Not limited to AI.** Tool calling is the main use case, but the spec makes no assumptions about who executes a tool or why.
- **Support cancellation and context.** Callers can pass an `AbortSignal`, a call identifier and a typed context of the application, like a database client or the current user.
- **Support static type inference.** The specification provides a standard way to "advertise" a tool's input, output and context types.
- **Avoid API conflicts.** The entire spec is tucked inside a single object property called `~standard`, which avoids potential naming conflicts with the API surface of existing libraries.

## FAQ

These are the most frequently asked questions about Standard Tool. If your question is not listed, feel free to create an issue.

### How do I create a Standard Tool?

Use the tool function of your AI library, as usual. If your library supports the spec, its tools are Standard Tools and can be executed by any other library that supports the spec.

If your library doesn't support the spec yet, create the `~standard` property yourself. It is a plain object, and any schema that implements both Standard Schema and Standard JSON Schema can be passed as `input` and `output`.

```ts
import type { StandardToolV1 } from "@standard-schema/spec";
import * as z from "zod";

const input = z.object({ city: z.string() });
const output = z.object({ city: z.string(), temperature: z.number() });

export const getWeather: StandardToolV1<
  z.output<typeof input>,
  z.input<typeof output>
> = {
  "~standard": {
    version: 1,
    vendor: "my-app",
    name: "get_weather",
    description: "Get the current temperature in a city, in degrees Celsius",
    input,
    output,
    async execute({ city }, options) {
      const response = await fetch(`https://example.com/weather/${city}`, {
        signal: options?.signal,
      });
      const { temperature } = await response.json();
      return { city, temperature };
    },
  },
};
```

### I'm an AI library author. How do I add the spec to my existing tool function?

Just like schema libraries add the `~standard` property to their schemas, add it to the tools returned by your existing function. Your API stays the same, existing tools become Standard Tools without any changes by your users, and your own features, like approval, stay next to `~standard`. Other libraries ignore them.

Pass the schemas of the tool as they are and map the options of the spec to the options of your API:

```ts
export function tool(config) {
  return {
    ...config,
    "~standard": {
      version: 1,
      vendor: "my-ai-lib",
      description: config.description,
      input: config.inputSchema,
      // map the options of the spec to the options of your API
      execute: (input, options) =>
        config.execute(input, {
          toolCallId: options?.callId ?? "",
          abortSignal: options?.signal,
          context: options?.context,
        }),
    },
  };
}
```

If your `execute` function validates its input itself, move the validation to the place where your library executes its tools, so `~standard.execute` receives the already validated input. Features that only your library provides, like suspending a tool or streaming its progress, can't be part of `~standard.execute`. Make them optional there, or fail with a clear error, so the tool still works in other libraries.

Refer to the [extension example](https://github.com/standard-schema/standard-schema/blob/main/packages/examples/tool-extend.ts) for a fully typed version, and to the [implementation example](https://github.com/standard-schema/standard-schema/blob/main/packages/examples/tool-implement.ts) for a new tool function that infers the types of the tool from its schemas.

### I'm an AI library author. How do I execute Standard Tools?

Validate the input with the input schema of the tool, pass the `value` of the result to `execute`, and validate the returned value with the output schema.

If the input is invalid, don't run the tool. Don't throw an error in this case either, since this usually ends the run or hides the issues from the model. Instead, send the issues back to the model as the result of the tool call. Each issue has a message and a path to the invalid value, so the model can fix its input and call the tool again. If the output is invalid, the tool already ran, so report the error instead of letting the model retry it.

```ts
import type { StandardToolV1 } from "@standard-schema/spec";

async function executeToolCall(
  tool: StandardToolV1<any, unknown, undefined>,
  value: unknown,
) {
  const { input, output } = tool["~standard"];

  // validate the input, since the model can't be trusted
  const inputResult = input
    ? await input["~standard"].validate(value)
    : { value };
  if (inputResult.issues) {
    // don't throw: return the issues to the model, so it can fix its input
    return {
      isError: true,
      content: `Invalid input, fix it and try again: ${JSON.stringify(inputResult.issues)}`,
    };
  }

  // the output of the input schema is the input of `execute`
  const returned = await tool["~standard"].execute(inputResult.value);

  // the output of `execute` is the input of the output schema
  const outputResult = output
    ? await output["~standard"].validate(returned)
    : { value: returned };
  if (outputResult.issues) {
    // the tool already ran, so it should not simply be retried
    return { isError: true, content: "The tool returned an invalid output" };
  }

  return { isError: false, content: JSON.stringify(outputResult.value) };
}
```

Refer to the [integration example](https://github.com/standard-schema/standard-schema/blob/main/packages/examples/tool-integrate.ts) for a worked example, including thrown errors.

### What about error handling?

Invalid input or output is detected by the schemas, so it is reported as Standard Schema issues by `validate`, and the caller decides how to handle them:

- Issues of the input: The tool did not run. The caller can correct the input and execute the tool again, e.g. by sending the issues back to the model.
- Issues of the output: The tool ran, but its output is invalid. Since the tool may already have caused side effects, it is not always safe to execute it again.

If the tool fails for any other reason, e.g. because a network request failed, `execute` throws.

### How do I describe a tool to an AI model?

Use `name`, `description` and the JSON Schema of `input`. Most model providers require a top-level object schema and a name that matches `^[a-zA-Z0-9_-]{1,64}$`, so use an empty object schema if `input` is omitted and fall back to a name of your own if `name` is missing.

```ts
import type { StandardToolV1 } from "@standard-schema/spec";

function describeTool(tool: StandardToolV1<any, unknown, never>, name: string) {
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

### Why is the input `any` when accepting tools?

The input of `execute` is a parameter, so a tool that expects a `{ city: string }` can't be used as a tool that accepts `unknown`. A library that accepts tools with different inputs uses `StandardToolV1<any, unknown, Context>` instead. This is safe, because it gets the input from the input schema of each tool and doesn't create it itself. A plain `StandardToolV1` only accepts tools whose `execute` function accepts any value.

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
  tools: ReadonlyArray<StandardToolV1<any, unknown, RequestContext>>,
) {
  // each tool is executed with `{ context: requestContext }`
}
```

A context of `unknown`, the default, only accepts tools that need no context. Use `undefined` to also accept tools whose context is optional, and `never` to accept every tool without executing it, e.g. to describe it.

### Which packages do I need?

None. The `@standard-schema/spec` package only contains types, so you can also copy and paste them into your project. A tool is a plain object, and validating its input and output only requires the `validate` function of its schemas.

### Why doesn't the tool validate its own input and output?

To give the caller full control. The caller knows where the input comes from and what happens with the output, so it is in the best position to decide:

- whether a value needs to be validated at all, e.g. not if it comes from typed code,
- how and when it is validated, e.g. with vendor-specific options or before asking the user for approval,
- and how issues are handled, e.g. by sending them back to the model, repairing the input or throwing an error.

This also keeps `execute` a plain, fully typed function, and its result is the output of the tool instead of a result object.

### Why do `input` and `output` require Standard Schema and Standard JSON Schema?

Standard JSON Schema is needed to describe the tool, e.g. to an AI model, and Standard Schema is needed to validate its input and output. Most schema libraries implement both on the same object, so their schemas can be passed as they are.

### Why is the `name` optional?

Many libraries name tools themselves, for example with the key of a record or the path of a file. If both exist, the library decides which one to use.

### Why is there no streaming or approval?

To keep the spec minimal. Approval is a decision of the caller, which can make it before calling `execute`. Streaming may be added in a future version.

### How to only allow synchronous tools?

The `~standard.execute()` function might return a synchronous value _or_ a `Promise`. If you only accept synchronous tools, you can simply throw an error if it returns an instance of `Promise`. The same applies to the `validate` function of the schemas.

```ts
import type { StandardToolV1 } from "@standard-schema/spec";

function executeToolSync<Input>(tool: StandardToolV1<Input>, input: Input) {
  const output = tool["~standard"].execute(input);
  if (output instanceof Promise) {
    throw new TypeError("Tool execution must be synchronous");
  }
  // ...
}
```
