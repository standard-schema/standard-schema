import type { LooseAutocomplete } from "../_types/index.ts";
import { SchemaError } from "../SchemaError/SchemaError.ts";
import {
  safeParseDictionary,
  safeParseDictionarySync,
} from "../safeParseDictionary/safeParseDictionary.ts";
import type { StandardSchemaV1Dictionary } from "../types/StandardSchemaDictionary.ts";

/**
 * Parse unknown data with a dictionary of schemas, throwing an error if the data is invalid.
 *
 * @param schemas The schemas to parse the data with.
 *
 * @param data The data to parse.
 *
 * @returns A promise that resolves to the parsed data.
 *
 * @throws {SchemaError} If the data is invalid.
 */
export async function parseDictionary<
  Schemas extends StandardSchemaV1Dictionary,
>(
  schemas: Schemas,
  data: LooseAutocomplete<
    StandardSchemaV1Dictionary.InferInput<Schemas>,
    Record<string, unknown>
  >,
): Promise<StandardSchemaV1Dictionary.InferOutput<Schemas>> {
  const result = await safeParseDictionary(schemas, data);
  if (result.issues) throw new SchemaError(result.issues);
  return result.value;
}

/**
 * Parse unknown data with a dictionary of schemas synchronously, throwing an error if the data is invalid or the schema validation is asynchronous.
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
export function parseDictionarySync<Schemas extends StandardSchemaV1Dictionary>(
  schemas: Schemas,
  data: LooseAutocomplete<
    StandardSchemaV1Dictionary.InferInput<Schemas>,
    Record<string, unknown>
  >,
): StandardSchemaV1Dictionary.InferOutput<Schemas> {
  const result = safeParseDictionarySync(schemas, data);
  if (result.issues) throw new SchemaError(result.issues);
  return result.value;
}
