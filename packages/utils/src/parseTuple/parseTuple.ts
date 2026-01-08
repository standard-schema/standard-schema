import type { LooseAutocomplete } from "../_types/index.ts";
import { SchemaError } from "../SchemaError/SchemaError.ts";
import {
  safeParseTuple,
  safeParseTupleSync,
} from "../safeParseTuple/safeParseTuple.ts";
import type { StandardSchemaV1Tuple } from "../types/StandardSchemaDictionary.ts";

/**
 * Parse unknown data with a tuple of schemas, throwing an error if the data is invalid.
 *
 * @param schemas The schemas to parse the data with.
 *
 * @param data The data to parse.
 *
 * @returns A promise that resolves to the parsed data.
 *
 * @throws {SchemaError} If the data is invalid.
 */
export async function parseTuple<TSchemas extends StandardSchemaV1Tuple>(
  schemas: TSchemas,
  data: LooseAutocomplete<
    StandardSchemaV1Tuple.InferInput<TSchemas>,
    unknown[]
  >,
): Promise<StandardSchemaV1Tuple.InferOutput<TSchemas>> {
  const result = await safeParseTuple(schemas, data);
  if (result.issues) throw new SchemaError(result.issues);
  return result.value;
}

/**
 * Parse unknown data with a tuple of schemas synchronously, throwing an error if the data is invalid or the schema validation is asynchronous.
 *
 * @param schemas The schemas to parse the data with.
 *
 * @param data The data to parse.
 *
 * @returns The parsed data.
 *
 * @throws {SchemaError} If the data is invalid.
 * @throws {TypeError} If the schema validation is asynchronous.
 */
export function parseTupleSync<TSchemas extends StandardSchemaV1Tuple>(
  schemas: TSchemas,
  data: LooseAutocomplete<
    StandardSchemaV1Tuple.InferInput<TSchemas>,
    unknown[]
  >,
): StandardSchemaV1Tuple.InferOutput<TSchemas> {
  const result = safeParseTupleSync(schemas, data);
  if (result.issues) throw new SchemaError(result.issues);
  return result.value;
}
