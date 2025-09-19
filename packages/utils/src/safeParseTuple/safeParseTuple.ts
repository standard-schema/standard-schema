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
export async function safeParseTuple<Schemas extends StandardSchemaV1Tuple>(
  schemas: Schemas,
  data: LooseAutocomplete<StandardSchemaV1Tuple.InferInput<Schemas>, unknown[]>,
): Promise<
  StandardSchemaV1.Result<StandardSchemaV1Tuple.InferOutput<Schemas>>
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
    ) as StandardSchemaV1Tuple.InferOutput<Schemas>,
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
export function safeParseTupleSync<Schemas extends StandardSchemaV1Tuple>(
  schemas: Schemas,
  data: LooseAutocomplete<StandardSchemaV1Tuple.InferInput<Schemas>, unknown[]>,
): StandardSchemaV1.Result<StandardSchemaV1Tuple.InferOutput<Schemas>> {
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
    ) as StandardSchemaV1Tuple.InferOutput<Schemas>,
  };
}
