/**
 * This example shows how to implement the Standard Function interface.
 * It builds a function from an input schema, an optional output schema and a
 * handler. The function validates its own input and output, and reports
 * failures its caller can act on as results instead of throwing.
 */

import type {
  StandardFunctionV1,
  StandardJSONSchemaV1,
  StandardSchemaV1,
} from "@standard-schema/spec";

/**
 * A schema that implements both Standard Schema and Standard JSON Schema,
 * like the ones Zod, ArkType, and Valibot produce.
 */
type FunctionSchema<Input = unknown, Output = Input> = StandardSchemaV1<
  Input,
  Output
> &
  StandardJSONSchemaV1<Input, Output>;

/** Thrown by a handler to report a failure that is safe to show its caller. */
export class FunctionFailure extends Error {}

export function defineFunction<
  InputIn,
  InputOut,
  Return,
  Output = Return,
  Options extends StandardFunctionV1.Options = StandardFunctionV1.Options,
>(definition: {
  name: string;
  description?: string;
  input: FunctionSchema<InputIn, InputOut>;
  output?: FunctionSchema<Return, Output>;
  run: (input: InputOut, options: Options) => Return | Promise<Return>;
}): StandardFunctionV1<InputIn, Output, Options> {
  return {
    "~standard": {
      version: 1,
      vendor: "example-lib",
      name: definition.name,
      description: definition.description ?? "",
      jsonSchema: {
        // the caller passes what the input schema accepts
        input: (options) =>
          definition.input["~standard"].jsonSchema.input(options),
        // without an output schema, the output can be any value
        output: (options) =>
          definition.output?.["~standard"].jsonSchema.output(options) ?? {},
      },
      async execute(value, options) {
        // callers may pass arguments a model produced, so validate them first
        const input = await definition.input["~standard"].validate(value);
        if (input.issues) return { source: "input", issues: input.issues };

        let output: unknown;
        try {
          output = await definition.run(input.value, options);
        } catch (error) {
          // only failures the handler chose to report are returned; anything
          // else is unexpected, may contain internal details, and is rethrown
          if (!(error instanceof FunctionFailure)) throw error;
          return { source: "execution", issues: [{ message: error.message }] };
        }

        if (!definition.output) return { value: output as Output };
        const result = await definition.output["~standard"].validate(output);
        if (result.issues) return { source: "output", issues: result.issues };
        return { value: result.value };
      },
    },
  };
}

// usage example, with hand-written schemas standing in for a schema library
function objectSchema<T>(
  jsonSchema: Record<string, unknown>,
  check: (value: Record<string, unknown>) => StandardSchemaV1.Result<T>,
): FunctionSchema<T> {
  const convert = (options: StandardJSONSchemaV1.Options) => {
    if (options.target !== "draft-2020-12" && options.target !== "draft-07") {
      throw new Error(`Unsupported target: ${options.target}`);
    }
    return jsonSchema;
  };
  return {
    "~standard": {
      version: 1,
      vendor: "example-lib",
      validate: (value) =>
        typeof value === "object" && value !== null
          ? check(value as Record<string, unknown>)
          : { issues: [{ message: "Expected an object" }] },
      jsonSchema: { input: convert, output: convert },
    },
  };
}

const citySchema = objectSchema<{ city: string }>(
  {
    type: "object",
    properties: { city: { type: "string" } },
    required: ["city"],
  },
  (value) =>
    typeof value.city === "string"
      ? { value: { city: value.city } }
      : { issues: [{ message: "Expected a string", path: ["city"] }] },
);

const weatherSchema = objectSchema<{ city: string; temperature: number }>(
  {
    type: "object",
    properties: { city: { type: "string" }, temperature: { type: "number" } },
    required: ["city", "temperature"],
  },
  (value) =>
    typeof value.city === "string" && typeof value.temperature === "number"
      ? { value: { city: value.city, temperature: value.temperature } }
      : { issues: [{ message: "Expected a city and a temperature" }] },
);

// What the weather function needs from its caller.
interface WeatherContext {
  apiKey: string;
}

export const getWeather: StandardFunctionV1<
  { city: string },
  { city: string; temperature: number },
  StandardFunctionV1.Options & { context: WeatherContext }
> = defineFunction({
  name: "get_weather",
  description: "Get the current temperature in a city, in degrees Celsius",
  input: citySchema,
  output: weatherSchema,
  run: async (
    { city },
    {
      signal,
      context,
    }: StandardFunctionV1.Options & { context: WeatherContext },
  ) => {
    const response = await fetch(`https://example.com/weather/${city}`, {
      headers: { authorization: context.apiKey },
      signal: signal ?? null,
    });
    // a failure the caller can act on, like a model correcting its input
    if (response.status === 404)
      throw new FunctionFailure(`No city named ${city}`);
    const { temperature }: { temperature: number } = await response.json();
    return { city, temperature };
  },
});

await getWeather["~standard"].execute(
  { city: "Paris" },
  { signal: AbortSignal.timeout(10_000), context: { apiKey: "..." } },
);
// => { value: { city: "Paris", temperature: 21 } }

// A function can also stream its results. What successive results mean is up
// to the function: here, each one is a snapshot that replaces the previous one.
type Forecast = { city: string; days: number[] };

export const forecast: StandardFunctionV1<{ city: string }, Forecast> = {
  "~standard": {
    version: 1,
    vendor: "example-lib",
    name: "forecast",
    description: "Get the forecast for a city, one day at a time",
    jsonSchema: {
      input: (options) => citySchema["~standard"].jsonSchema.input(options),
      output: () => ({
        type: "object",
        properties: {
          city: { type: "string" },
          days: { type: "array", items: { type: "number" } },
        },
      }),
    },
    async execute(input, options) {
      // `execute` returns the last result of the stream
      let last: StandardFunctionV1.Result<Forecast> | undefined;
      for await (const result of this.executeStream!(input, options)) {
        last = result;
      }
      return last!;
    },
    async *executeStream(value, { signal }) {
      const input = await citySchema["~standard"].validate(value);
      if (input.issues) {
        yield { source: "input", issues: input.issues };
        return;
      }
      const { city } = input.value;
      const days: number[] = [];
      for (let day = 0; day < 3; day++) {
        signal?.throwIfAborted();
        days.push(20 + day);
        yield { value: { city, days: [...days] } };
      }
    },
  },
};
