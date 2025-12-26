import type { StandardJSONSchemaV1 } from "@standard-schema/spec";

// check for any version
export function isStandardJsonSchema(
  schema: unknown,
): schema is StandardJSONSchemaV1;
// check for specific version
export function isStandardJsonSchema(
  schema: unknown,
  version: 1,
): schema is StandardJSONSchemaV1;
export function isStandardJsonSchema(
  // biome-ignore lint/suspicious/noExplicitAny: we don't want to typeof check the schema itself - only the ~standard property (schemas can be objects or functions, for example)
  schema: any,
  version?: number,
): schema is StandardJSONSchemaV1 {
  if (schema == null) return false;
  const standardProps = schema["~standard"];
  const baseConditions =
    typeof standardProps === "object" &&
    typeof standardProps.jsonSchema === "object" &&
    typeof standardProps.jsonSchema.input === "function" &&
    typeof standardProps.jsonSchema.output === "function" &&
    typeof standardProps.version === "number" &&
    typeof standardProps.vendor === "string";
  return version == null
    ? baseConditions
    : baseConditions && standardProps.version === version;
}
