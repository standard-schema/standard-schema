import type { StandardSchemaV1 } from "@standard-schema/spec";
import { isStandardSchema } from "../isStandardSchema/isStandardSchema.ts";

export type SchemaArgs<TArgs extends unknown[]> =
  | TArgs
  | [schema: StandardSchemaV1, ...args: TArgs];

/**
 * Some functions take a schema as a first argument for inference purposes.
 * This function removes the schema from the arguments if it exists.
 *
 * @param args The arguments to remove the schema from.
 *
 * @returns The arguments without the schema.
 */
export function _removeSchemaArg<TArgs extends unknown[]>(
  args: SchemaArgs<TArgs>,
): TArgs {
  return (isStandardSchema(args[0]) ? args.slice(1) : args) as TArgs;
}
