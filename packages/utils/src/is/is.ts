import type { StandardSchemaV1 } from "@standard-schema/spec";
import { safeParseSync } from "../safeParse/safeParse.ts";

/**
 * Check *synchronously* whether the input matches the schema.
 *
 * @param schema The schema to check the input against.
 *
 * @param input The input to check.
 *
 * @returns Whether the input matches the schema.
 *
 * @throws {TypeError} If the schema validation is asynchronous.
 */
export function is<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  input: unknown,
): input is StandardSchemaV1.InferInput<TSchema> {
  return !safeParseSync(schema, input).issues;
}
