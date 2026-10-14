/**
 * This example shows how to implement the Standard Tool interface.
 * It demonstrates exposing a tool built from a schema and a handler, where
 * the tool validates its own input before running the handler.
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

export function tool<InputIn, InputOut, Output, Context = unknown>(definition: {
  name: string;
  description: string;
  input: ToolSchema<InputIn, InputOut>;
  output?: StandardJSONSchemaV1<Output>;
  run: (
    input: InputOut,
    options: RunOptions<Context>,
  ) => Output | Promise<Output>;
}): MyTool<InputIn, Output, Context> {
  return {
    type: "tool",
    "~standard": {
      version: 1,
      vendor: "example-lib",
      name: definition.name,
      description: definition.description,
      jsonSchema: {
        // the model's arguments are described by the input schema's input
        input: (options) =>
          definition.input["~standard"].jsonSchema.input(options),
        // without an output schema, the result can be any value
        output: (options) =>
          definition.output?.["~standard"].jsonSchema.output(options) ?? {},
      },
      // annotated, since `execute`'s parameters can't be inferred while `Context` is generic
      async execute(input, options?: StandardToolV1.Options<Context>) {
        // callers pass the model's arguments as-is, so validate them first
        const result = await definition.input["~standard"].validate(input);
        if (result.issues) {
          // prefer the library's own summary, since it is what the model reads
          throw new Error(result.message ?? JSON.stringify(result.issues));
        }
        // forward the signal so the handler can stop its work early, and the
        // context it needs, which callers must pass unless it can be undefined
        return definition.run(result.value, {
          ...options,
          context: options?.context as Context,
        });
      },
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
    const { temperature }: { temperature: number } = await response.json();
    return { city, temperature };
  },
});

await getWeather["~standard"].execute(
  { city: "Paris" },
  { signal: AbortSignal.timeout(10_000) },
);
// => { city: "Paris", temperature: 21 }

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
    return `Hello ${user.name}, welcome to ${city}`;
  },
});

declare const db: Db;
await greet["~standard"].execute(
  { city: "Paris" },
  { context: { db, userId: "1" } },
);
// leaving out the context is a type error, since greet can't run without it
