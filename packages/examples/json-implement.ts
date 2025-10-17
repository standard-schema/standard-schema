/**
 * This example shows how to implement the Standard JSON Schema Source interface.
 * It demonstrates creating schemas that support both validation and JSON Schema generation.
 */

import type { StandardSchemaV1 } from "@standard-schema/spec";

interface StringSchemaWithJSON
  extends StandardSchemaV1.WithJSONSchemaSource<string> {
  type: "string";
  message: string;
}

function stringWithJSON(message = "Invalid string"): StringSchemaWithJSON {
  return {
    type: "string",
    message,
    "~standard": {
      version: 1,
      vendor: "example-lib",
      validate(value) {
        return typeof value === "string"
          ? { value }
          : { issues: [{ message, path: [] }] };
      },
      toJSONSchema(params) {
        const schema: Record<string, unknown> = {
          type: "string",
        };

        // Add schema version based on target
        if (params?.target === "draft-2020-12") {
          schema.$schema = "https://json-schema.org/draft/2020-12/schema";
        } else if (params?.target === "draft-07") {
          schema.$schema = "http://json-schema.org/draft-07/schema#";
        }

        return schema;
      },
    },
  };
}

// usage example
const stringSchema = stringWithJSON();
stringSchema["~standard"].toJSONSchema();
// => { $schema: "https://json-schema.org/draft/2020-12/schema", type: "string" }
