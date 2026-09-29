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
interface MyTool<Input, Output> extends StandardToolV1<Input, Output> {
  type: "tool";
}

export function tool<InputIn, InputOut, Output>(definition: {
  name: string;
  description: string;
  input: ToolSchema<InputIn, InputOut>;
  output?: StandardJSONSchemaV1<Output>;
  run: (
    input: InputOut,
    options?: StandardToolV1.Options,
  ) => Output | Promise<Output>;
}): MyTool<InputIn, Output> {
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
      async execute(input, options) {
        // callers pass the model's arguments as-is, so validate them first
        const result = await definition.input["~standard"].validate(input);
        if (result.issues) {
          throw new Error(JSON.stringify(result.issues));
        }
        // forward the signal so the handler can stop its work early
        return definition.run(result.value, options);
      },
    },
  };
}

// usage example, with a hand-written schema standing in for a schema library
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
      input() {
        return {
          type: "object",
          properties: { city: { type: "string" } },
          required: ["city"],
        };
      },
      output(options) {
        // input and output are the same in this example
        return this.input(options);
      },
    },
  },
};

const getWeather = tool({
  name: "get_weather",
  description: "Get the current temperature in a city, in degrees Celsius",
  input: citySchema,
  run: async ({ city }, options) => {
    const response = await fetch(`https://example.com/weather/${city}`, {
      signal: options?.signal ?? null,
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
