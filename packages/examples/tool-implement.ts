/**
 * This example shows how to implement the Standard Tool interface.
 * It demonstrates a library's `tool` function that takes a schema and a
 * handler. The tool doesn't validate, so its caller validates with the schema
 * before running it.
 */

import type {
  StandardJSONSchemaV1,
  StandardSchemaV1,
  StandardToolV1,
} from "@standard-schema/spec";

// A schema that implements both Standard Schema and Standard JSON Schema.
type ToolSchema<Output> = StandardSchemaV1<unknown, Output> &
  StandardJSONSchemaV1<unknown, Output>;

interface ToolDefinition<Input, Output, Context> {
  name: string;
  description: string;
  input: ToolSchema<Input>;
  output?: StandardJSONSchemaV1<Output, unknown>;
  // the spec's own `execute`, so it's passed through as-is, and the options
  // its handler declares infer the context callers must pass
  execute: StandardToolV1.ExecuteFunction<Input, Output, Context>;
}

export function tool<Input, Output, Context = unknown>(
  definition: ToolDefinition<Input, Output, Context>,
): StandardToolV1.Validatable<Input, Output, Context> {
  const { name, description, input, output, execute } = definition;
  return {
    "~standard": {
      version: 1,
      vendor: "example-lib",
      name,
      description,
      input,
      ...(output && { output }),
      execute,
    },
  };
}

// usage example, with a schema from any library that implements both specs
interface City {
  city: string;
}

declare const citySchema: ToolSchema<City>;

// A tool that needs something from its caller declares it as its context.
interface Db {
  getUser(id: string): Promise<{ name: string } | undefined>;
}

interface GreetContext {
  db: Db;
  userId: string;
}

interface GreetOptions extends StandardToolV1.Options<GreetContext> {
  readonly context: GreetContext;
}

const greet = tool({
  name: "greet",
  description: "Greet the current user in a city",
  input: citySchema,
  execute: async ({ city }, { context }: GreetOptions) => {
    const user = await context.db.getUser(context.userId);
    // a failure its caller can act on is returned; anything unexpected rejects
    if (!user) return { issues: [{ message: "Sign in to get a greeting" }] };
    return { value: `Hello ${user.name}, welcome to ${city}` };
  },
});

declare const db: Db;
await greet["~standard"].execute(
  { city: "Paris" },
  { context: { db, userId: "1" } },
);
// @ts-expect-error greet can't run without its context
await greet["~standard"].execute({ city: "Paris" });
