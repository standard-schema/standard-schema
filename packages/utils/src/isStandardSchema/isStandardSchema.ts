import type { StandardSchemaV1 } from "@standard-schema/spec";

export const isStandardSchema: {
  // check for any version
  (schema: unknown): schema is StandardSchemaV1;
  // specific version checks
  v1(schema: unknown): schema is StandardSchemaV1;
} = Object.assign(
  function isStandardSchema(schema: unknown): schema is StandardSchemaV1 {
    // biome-ignore lint/suspicious/noExplicitAny: avoids many unnecessary checks
    return typeof (schema as any)?.["~standard"] === "object";
  },
  {
    v1(schema: unknown): schema is StandardSchemaV1 {
      return isStandardSchema(schema) && schema["~standard"].version === 1;
    },
  },
);
