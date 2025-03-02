import type { StandardSchemaV1 } from "@standard-schema/spec";
import { SchemaError } from "../SchemaError/SchemaError.ts";
import type { LooseAutocomplete } from "../_types/index.ts";
import { safeParse, safeParseSync } from "../safeParse/safeParse.ts";

/**
 * Parse unknown data with a schema, throwing an error if the data is invalid.
 *
 * @param schema The schema to parse the data with.
 *
 * @param data The data to parse.
 *
 * @returns A promise that resolves to the parsed data.
 *
 * @throws {SchemaError} If the data is invalid.
 */
export async function parse<Schema extends StandardSchemaV1>(
  schema: Schema,
  data: LooseAutocomplete<StandardSchemaV1.InferInput<Schema>>,
): Promise<StandardSchemaV1.InferOutput<Schema>> {
  const result = await safeParse(schema, data);
  if (result.issues) throw new SchemaError(result.issues);
  return result.value;
}

/**
 * Parse unknown data with a schema synchronously, throwing an error if the data is invalid or the schema validation is asynchronous.
 *
 * @param schema The schema to parse the data with.
 *
 * @param data The data to parse.
 *
 * @returns The parsed data.
 *
 * @throws {SchemaError} If the data is invalid.
 * @throws {TypeError} If the schema validation is asynchronous.
 */
export function parseSync<Schema extends StandardSchemaV1>(
  schema: Schema,
  data: LooseAutocomplete<StandardSchemaV1.InferInput<Schema>>,
): StandardSchemaV1.InferOutput<Schema> {
  const result = safeParseSync(schema, data);
  if (result.issues) throw new SchemaError(result.issues);
  return result.value;
}
