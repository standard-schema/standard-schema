import type { StandardSchemaV1 } from "@standard-schema/spec";
import { parseSync } from "../parse/parse.ts";

/**
 * Assert synchronously that the data matches the schema, throwing an error if it does not.
 *
 * @param schema The schema to check the data against.
 *
 * @param data The data to check.
 *
 * @throws {SchemaError} If the data does not match the schema.
 */
export function assert<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  data: unknown,
): asserts data is StandardSchemaV1.InferInput<TSchema> {
  parseSync(schema, data);
}
