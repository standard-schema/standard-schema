/**
 * This example shows how to implement the Standard Tool interface.
 * It demonstrates exposing a tool built from schemas and a handler. The tool
 * doesn't validate, so its caller validates with the schemas before running it.
 */

import type {
  StandardJSONSchemaV1,
  StandardSchemaV1,
  StandardToolV1,
} from "@standard-schema/spec";

/**
 * A schema that implements both Standard Schema and Standard JSON Schema,
 * like the ones Zod, ArkType, and Valibot produce.
 */
type ToolSchema<Input = unknown, Output = Input> = StandardSchemaV1<
  Input,
  Output
> &
  StandardJSONSchemaV1<Input, Output>;

// A framework's own tool object can implement the spec alongside its existing API.
interface MyTool<Input, Output, Context>
  extends StandardToolV1<Input, Output, Context> {
  type: "tool";
}

// What the handler receives beside its input: the caller's signal, call id and context.
interface RunOptions<Context> extends StandardToolV1.Options<Context> {
  readonly context: Context;
}

export function tool<Input, Output, Context = unknown>(definition: {
  name: string;
  description: string;
  input: StandardJSONSchemaV1<unknown, Input>;
  output?: StandardJSONSchemaV1<Output, unknown>;
  run: (
    input: Input,
    options: RunOptions<Context>,
  ) => Promise<StandardSchemaV1.Result<Output>>;
}): MyTool<Input, Output, Context> {
  return {
    type: "tool",
    "~standard": {
      version: 1,
      vendor: "example-lib",
      name: definition.name,
      description: definition.description,
      input: definition.input,
      ...(definition.output && { output: definition.output }),
      // annotated, since `execute`'s parameters can't be inferred while `Context` is generic
      execute: (input, options?: StandardToolV1.Options<Context>) =>
        // forward the signal so the handler can stop its work early, and the
        // context it needs, which callers must pass unless it can be undefined
        definition.run(input, {
          ...options,
          context: options?.context as Context,
        }),
    },
  };
}

// usage example, with a hand-written schema standing in for a schema library
function cityJsonSchema(
  options: StandardJSONSchemaV1.Options,
): Record<string, unknown> {
  // the schema is the same in both recommended targets, so support those and
  // throw for any other
  if (options.target !== "draft-2020-12" && options.target !== "draft-07") {
    throw new Error(`Unsupported target: ${options.target}`);
  }
  return {
    type: "object",
    properties: { city: { type: "string" } },
    required: ["city"],
  };
}

const citySchema: ToolSchema<{ city: string }> = {
  "~standard": {
    version: 1,
    vendor: "example-lib",
    validate(value) {
      return typeof value === "object" &&
        value !== null &&
        "city" in value &&
        typeof value.city === "string"
        ? { value: { city: value.city } }
        : { issues: [{ message: "Expected a string", path: ["city"] }] };
    },
    jsonSchema: {
      input: cityJsonSchema,
      // input and output are the same in this example
      output: cityJsonSchema,
    },
  },
};

const getWeather = tool({
  name: "get_weather",
  description: "Get the current temperature in a city, in degrees Celsius",
  input: citySchema,
  run: async ({ city }, options) => {
    const response = await fetch(`https://example.com/weather/${city}`, {
      signal: options.signal ?? null,
    });
    // a failure the model can act on is returned; anything unexpected, like a
    // network error, rejects
    if (response.status === 404) {
      return { issues: [{ message: `No city named ${city}` }] };
    }
    const { temperature }: { temperature: number } = await response.json();
    return { value: { city, temperature } };
  },
});

await getWeather["~standard"].execute(
  { city: "Paris" },
  { signal: AbortSignal.timeout(10_000) },
);
// => { value: { city: "Paris", temperature: 21 } }

// A tool that needs something from its caller declares it as its context.
interface Db {
  getUser(id: string): Promise<{ name: string }>;
}

const greet = tool({
  name: "greet",
  description: "Greet the current user in a city",
  input: citySchema,
  run: async (
    { city },
    { context }: RunOptions<{ db: Db; userId: string }>,
  ) => {
    const user = await context.db.getUser(context.userId);
    return { value: `Hello ${user.name}, welcome to ${city}` };
  },
});

declare const db: Db;
await greet["~standard"].execute(
  { city: "Paris" },
  { context: { db, userId: "1" } },
);
// leaving out the context is a type error, since greet can't run without it
