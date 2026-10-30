/**
 * This example shows how an AI library implements the Standard Tool
 * interface with `createStandardToolFactory`, and how its users create tools
 * with it. The tools validate their own input and output.
 */

import type {
  StandardJSONSchemaV1,
  StandardSchemaV1,
  StandardToolV1,
} from "@standard-schema/spec";
import {
  type CreateStandardTool,
  createStandardToolFactory,
} from "@standard-schema/utils";

// Step 1: Create the `createStandardTool` function of your AI library
export const createStandardTool: CreateStandardTool =
  createStandardToolFactory("my-ai-lib");

// Step 2: Users create tools with a schema library of their choice. This
// hand-written schema stands in for one.
function cityJsonSchema(
  options: StandardJSONSchemaV1.Options,
): Record<string, unknown> {
  if (options.target !== "draft-2020-12" && options.target !== "draft-07") {
    throw new Error(`Unsupported target: ${options.target}`);
  }
  return {
    type: "object",
    properties: { city: { type: "string" } },
    required: ["city"],
  };
}

const citySchema: StandardSchemaV1<{ city: string }> &
  StandardJSONSchemaV1<{ city: string }> = {
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
      output: cityJsonSchema,
    },
  },
};

// A tool that needs something from its caller declares it as its context.
interface Db {
  getUser(id: string): Promise<{ name: string }>;
}

export const greet: StandardToolV1<
  { city: string },
  string,
  { db: Db; userId: string }
> = createStandardTool({
  name: "greet",
  description: "Greet the current user in a city",
  input: citySchema,
  async execute(
    { city },
    options: StandardToolV1.Options<{ db: Db; userId: string }>,
  ) {
    if (!options.context) {
      throw new Error("Missing context");
    }
    const { db, userId } = options.context;
    const user = await db.getUser(userId);
    return `Hello ${user.name}, welcome to ${city}`;
  },
});

// Step 3: The tool can be executed by any library that supports the spec
export async function run(db: Db): Promise<void> {
  const result = await greet["~standard"].execute(
    { city: "Berlin" },
    { context: { db, userId: "1" } },
  );
  if (result.issues) {
    // the input is invalid and the tool did not run
  } else {
    // the validated output is in `result.value`
  }
}
