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
 */
export function is<Schema extends StandardSchemaV1>(
  schema: Schema,
  input: unknown,
): input is StandardSchemaV1.InferInput<Schema> {
  return !safeParseSync(schema, input).issues;
}
