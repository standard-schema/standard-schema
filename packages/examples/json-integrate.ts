import type { StandardJSONSchemaV1 } from "@standard-schema/spec";

// Function that accepts any compliant `StandardJSONSchemaV1`
// and converts it to a JSON Schema.
export function acceptSchema(schema: StandardJSONSchemaV1): unknown {
  // do stuff, e.g.
  return schema["~standard"].jsonSchema.input({
    target: "draft-2020-12",
  });
}

export function parseData<T extends StandardJSONSchemaV1>(
  schema: T,
  data: StandardJSONSchemaV1.InferInput<T>, // extract input type
) {
  // @ts-expect-error - replace doStuff with your own logic
  const result = doStuff(schema, data);
  return result as StandardJSONSchemaV1.InferOutput<T>; // extract output type
}
