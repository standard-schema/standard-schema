import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { LooseAutocomplete } from "../_types/index.ts";
import { safeParse, safeParseSync } from "../safeParse/safeParse.ts";
import type { StandardSchemaV1Dictionary } from "../types/StandardSchemaDictionary.ts";

/**
 * Parse unknown data with a dictionary of schemas, returning a result object.
 *
 * @param schemas The schemas to parse the data with.
 *
 * @param data The data to parse.
 *
 * @returns A promise that resolves to a result object.
 */
export async function safeParseDictionary<
  TSchemas extends StandardSchemaV1Dictionary,
>(
  schemas: TSchemas,
  data: LooseAutocomplete<
    StandardSchemaV1Dictionary.InferInput<TSchemas>,
    Record<string, unknown>
  >,
): Promise<
  StandardSchemaV1.Result<StandardSchemaV1Dictionary.InferOutput<TSchemas>>
> {
  const results = await Promise.all(
    Object.entries(schemas).map(async ([key, schema]) => {
      const result = await safeParse(schema, data[key]);
      if (result.issues) {
        // @ts-expect-error ignoring readonly for performance
        // biome-ignore lint/suspicious/noAssignInExpressions: ignoring for performance
        for (const issue of result.issues) (issue.path ??= []).unshift(key);
      }
      return [key, result] as const;
    }),
  );
  const issues = results.flatMap(([, result]) => result.issues ?? []);
  if (issues.length) {
    return { issues };
  }
  return {
    value: Object.fromEntries(
      results.map(([key, result]) => [
        key,
        (result as StandardSchemaV1.SuccessResult<unknown>).value,
      ]),
    ) as StandardSchemaV1Dictionary.InferOutput<TSchemas>,
  };
}

/**
 * Parse unknown data with a dictionary of schemas synchronously, returning a result object.
 * Throws an error if the schema validation is asynchronous.
 *
 * @param schemas The schemas to parse the data with.
 *
 * @param data The data to parse.
 *
 * @returns A result object.
 *
 * @throws {TypeError} If the schema validation is asynchronous.
 */
export function safeParseDictionarySync<
  TSchemas extends StandardSchemaV1Dictionary,
>(
  schemas: TSchemas,
  data: LooseAutocomplete<
    StandardSchemaV1Dictionary.InferInput<TSchemas>,
    Record<string, unknown>
  >,
): StandardSchemaV1.Result<StandardSchemaV1Dictionary.InferOutput<TSchemas>> {
  const results = Object.entries(schemas).map(([key, schema]) => {
    const result = safeParseSync(schema, data[key]);
    if (result.issues) {
      // @ts-expect-error ignoring readonly for performance
      // biome-ignore lint/suspicious/noAssignInExpressions: ignoring for performance
      for (const issue of result.issues) (issue.path ??= []).unshift(key);
    }
    return [key, result] as const;
  });
  const issues = results.flatMap(([, result]) => result.issues ?? []);
  if (issues.length) {
    return { issues };
  }
  return {
    value: Object.fromEntries(
      results.map(([key, result]) => [
        key,
        (result as StandardSchemaV1.SuccessResult<unknown>).value,
      ]),
    ) as StandardSchemaV1Dictionary.InferOutput<TSchemas>,
  };
}
