/**
 * This example shows how to implement the Standard Tool interface.
 * It demonstrates exposing a tool built from a schema and a handler, where
 * the handler receives input that the caller has already validated.
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
interface MyTool<InputIn, InputOut, OutputIn, OutputOut>
  extends StandardToolV1<InputIn, InputOut, OutputIn, OutputOut> {
  type: "tool";
}

export function tool<
  InputIn,
  InputOut,
  OutputIn,
  OutputOut = OutputIn,
>(definition: {
  name: string;
  description: string;
  input: ToolSchema<InputIn, InputOut>;
  output?: ToolSchema<OutputIn, OutputOut>;
  run: (input: InputOut) => OutputIn | Promise<OutputIn>;
}): MyTool<InputIn, InputOut, OutputIn, OutputOut> {
  return {
    type: "tool",
    "~standard": {
      version: 1,
      vendor: "example-lib",
      name: definition.name,
      description: definition.description,
      inputSchema: definition.input,
      outputSchema: definition.output,
      // callers validate input with `inputSchema` first, so the handler can run as-is
      execute: definition.run,
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
  run: ({ city }) => ({ city, temperature: 21 }),
});

// `execute` receives the output of `inputSchema`, which callers produce by
// validating the model's arguments
await getWeather["~standard"].execute({ city: "Paris" });
// => { city: "Paris", temperature: 21 }
