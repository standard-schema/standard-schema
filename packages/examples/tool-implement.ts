/**
 * This example shows how an AI library implements the Standard Tool
 * interface in its `tool` function, and how its users create tools with it.
 * The tools don't validate anything themselves. Their `execute` function is
 * fully typed, and their schemas let the caller validate the input and output.
 */

import type {
  StandardJSONSchemaV1,
  StandardSchemaV1,
  StandardToolV1,
} from "@standard-schema/spec";

// Step 1: Implement the `tool` function of your AI library. The input of
// `execute` is the output of the input schema, and the output of `execute` is
// the input of the output schema.
interface ToolConfig<
  TInput extends StandardToolV1.Schema,
  TOutput extends StandardToolV1.Schema,
  TContext,
> {
  name?: string;
  description?: string;
  input: TInput;
  output: TOutput;
  execute: (
    input: StandardSchemaV1.InferOutput<TInput>,
    options?: StandardToolV1.Options<TContext>,
  ) =>
    | StandardSchemaV1.InferInput<TOutput>
    | Promise<StandardSchemaV1.InferInput<TOutput>>;
}

export function tool<
  TInput extends StandardToolV1.Schema,
  TOutput extends StandardToolV1.Schema,
  TContext = unknown,
>(
  config: ToolConfig<TInput, TOutput, TContext>,
): StandardToolV1<
  StandardSchemaV1.InferOutput<TInput>,
  StandardSchemaV1.InferInput<TOutput>,
  TContext
> {
  return {
    "~standard": {
      version: 1,
      vendor: "my-ai-lib",
      name: config.name,
      description: config.description,
      input: config.input,
      output: config.output,
      execute: config.execute,
    },
  };
}

// Step 2: Users create tools with a schema library of their choice. These
// hand-written schemas stand in for one.
function createSchema<T>(
  jsonSchema: Record<string, unknown>,
  check: (value: unknown) => value is T,
): StandardSchemaV1<T> & StandardJSONSchemaV1<T> {
  const toJsonSchema = (options: StandardJSONSchemaV1.Options) => {
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
        check(value) ? { value } : { issues: [{ message: "Invalid value" }] },
      jsonSchema: { input: toJsonSchema, output: toJsonSchema },
    },
  };
}

const citySchema = createSchema(
  {
    type: "object",
    properties: { city: { type: "string" } },
    required: ["city"],
  },
  (value): value is { city: string } =>
    typeof value === "object" &&
    value !== null &&
    "city" in value &&
    typeof value.city === "string",
);

const greetingSchema = createSchema(
  { type: "string" },
  (value): value is string => typeof value === "string",
);

// A tool that needs something from its caller declares it as its context.
interface Db {
  getUser(id: string): Promise<{ name: string }>;
}

export const greet: StandardToolV1<
  { city: string },
  string,
  { db: Db; userId: string }
> = tool({
  name: "greet",
  description: "Greet the current user in a city",
  input: citySchema,
  output: greetingSchema,
  async execute(
    { city },
    options?: StandardToolV1.Options<{ db: Db; userId: string }>,
  ) {
    if (!options?.context) {
      throw new Error("Missing context");
    }
    const { db, userId } = options.context;
    const user = await db.getUser(userId);
    return `Hello ${user.name}, welcome to ${city}`;
  },
});

// Step 3: Since `execute` is fully typed, typed code can call it directly with
// a trusted input. Libraries that execute it with an untrusted input, like a
// tool call of a model, validate it with its schemas first. Refer to the
// integration example for that.
export async function run(db: Db): Promise<string> {
  return greet["~standard"].execute(
    { city: "Berlin" },
    { context: { db, userId: "1" } },
  );
}
