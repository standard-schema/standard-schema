/**
 * This example shows how to implement the Standard JSON Schema interface.
 * It demonstrates creating schemas that support both validation and JSON Schema generation.
 */

import type {
  StandardJSONSchemaV1,
  StandardSchemaV1,
} from "@standard-schema/spec";

interface CombinedProps<Input = unknown, Output = Input>
  extends StandardSchemaV1.Props<Input, Output>,
    StandardJSONSchemaV1.Props<Input, Output> {}

/**
 * An interface that combines StandardJSONSchema and StandardSchema.
 * */
interface StandardSchemaWithJSONSchema<Input = unknown, Output = Input> {
  "~standard": CombinedProps<Input, Output>;
}

interface MySchema extends StandardSchemaWithJSONSchema<string, string> {
  type: "string";
}

export function stringWithJSON(): MySchema {
  return {
    type: "string",
    "~standard": {
      version: 1,
      vendor: "example-lib",
      validate(value) {
        return typeof value === "string"
          ? { value }
          : { issues: [{ message: "Invalid string", path: [] }] };
      },
      jsonSchema: {
        input(params) {
          const schema: Record<string, unknown> = {
            type: "string",
          };

          // Add schema version based on target
          if (params.target === "draft-2020-12") {
            schema.$schema = "https://json-schema.org/draft/2020-12/schema";
          } else if (params.target === "draft-07") {
            schema.$schema = "http://json-schema.org/draft-07/schema#";
          } else {
            throw new Error(`Unsupported target: ${params.target}`);
          }

          return schema;
        },
        output(params) {
          // input and output are the same in this example
          return this.input(params);
        },
      },
    },
  };
}

// usage example
const stringSchema = stringWithJSON();

stringSchema["~standard"].jsonSchema.input({
  target: "draft-2020-12",
});
// => { $schema: "https://json-schema.org/draft/2020-12/schema", type: "string" }

stringSchema["~standard"].jsonSchema.input({
  target: "draft-07",
});
// => { $schema: "http://json-schema.org/draft-07/schema#", type: "string" }
