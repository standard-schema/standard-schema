import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { LooseAutocomplete } from "../_types/index.ts";

/**
 * Parse unknown data with a schema, returning a result object.
 *
 * @param schema The schema to parse the data with.
 *
 * @param data The data to parse.
 *
 * @returns A promise that resolves to a result object.
 */
export async function safeParse<Schema extends StandardSchemaV1>(
  schema: Schema,
  data: LooseAutocomplete<StandardSchemaV1.InferInput<Schema>>,
): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<Schema>>> {
  return schema["~standard"].validate(data);
}

/**
 * Parse unknown data with a schema synchronously, returning a result object.
 * Throws an error if the schema validation is asynchronous.
 *
 * @param schema The schema to parse the data with.
 *
 * @param data The data to parse.
 *
 * @returns A result object.
 *
 * @throws {TypeError} If the schema validation is asynchronous.
 */
export function safeParseSync<Schema extends StandardSchemaV1>(
  schema: Schema,
  data: LooseAutocomplete<StandardSchemaV1.InferInput<Schema>>,
): StandardSchemaV1.Result<StandardSchemaV1.InferOutput<Schema>> {
  const result = schema["~standard"].validate(data);
  if (result instanceof Promise) {
    throw new TypeError("Schema validation must be synchronous");
  }
  return result;
}
