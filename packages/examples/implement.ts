import type { StandardSchemaV1 } from "@standard-schema/spec";

// Step 1: Define the schema interface
interface StringSchema extends StandardSchemaV1<string> {
  type: "string";
  message: string;
}

// Step 2: Implement the schema interface
function string(message = "Invalid type"): StringSchema {
  return {
    type: "string",
    message,
    "~standard": {
      version: 1,
      vendor: "valizod",
      validate(value) {
        return typeof value === "string"
          ? { value }
          : { issues: [{ message, path: [] }] };
      },
    },
  };
}

const schema = string();
schema["~standard"].validate("hello");
