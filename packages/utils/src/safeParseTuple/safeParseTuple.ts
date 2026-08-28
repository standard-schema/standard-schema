import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { LooseAutocomplete } from "../_types/index.ts";
import { safeParse, safeParseSync } from "../safeParse/safeParse.ts";
import type { StandardSchemaV1Tuple } from "../types/StandardSchemaDictionary.ts";

/**
 * Parse unknown data with a tuple of schemas, returning a result object.
 *
 * @param schemas The schemas to parse the data with.
 *
 * @param data The data to parse.
 *
 * @returns A promise that resolves to a result object.
 */
export async function safeParseTuple<TSchemas extends StandardSchemaV1Tuple>(
  schemas: TSchemas,
  data: LooseAutocomplete<
    StandardSchemaV1Tuple.InferInput<TSchemas>,
    unknown[]
  >,
): Promise<
  StandardSchemaV1.Result<StandardSchemaV1Tuple.InferOutput<TSchemas>>
> {
  const results = await Promise.all(
    schemas.map(async (schema, index) => {
      const result = await safeParse(schema, data[index]);
      if (result.issues) {
        // @ts-expect-error ignoring readonly for performance
        // biome-ignore lint/suspicious/noAssignInExpressions: ignoring for performance
        for (const issue of result.issues) (issue.path ??= []).unshift(index);
      }
      return result;
    }),
  );
  const issues = results.flatMap((result) => result.issues ?? []);
  if (issues.length) {
    return { issues };
  }
  return {
    value: results.map(
      (result) => (result as StandardSchemaV1.SuccessResult<unknown>).value,
    ) as StandardSchemaV1Tuple.InferOutput<TSchemas>,
  };
}

/**
 * Parse unknown data with a tuple of schemas synchronously, returning a result object.
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
export function safeParseTupleSync<TSchemas extends StandardSchemaV1Tuple>(
  schemas: TSchemas,
  data: LooseAutocomplete<
    StandardSchemaV1Tuple.InferInput<TSchemas>,
    unknown[]
  >,
): StandardSchemaV1.Result<StandardSchemaV1Tuple.InferOutput<TSchemas>> {
  const results = schemas.map((schema, index) => {
    const result = safeParseSync(schema, data[index]);
    if (result.issues) {
      // @ts-expect-error ignoring readonly for performance
      // biome-ignore lint/suspicious/noAssignInExpressions: ignoring for performance
      for (const issue of result.issues) (issue.path ??= []).unshift(index);
    }
    return result;
  });
  const issues = results.flatMap((result) => result.issues ?? []);
  if (issues.length) {
    return { issues };
  }
  return {
    value: results.map(
      (result) => (result as StandardSchemaV1.SuccessResult<unknown>).value,
    ) as StandardSchemaV1Tuple.InferOutput<TSchemas>,
  };
}
