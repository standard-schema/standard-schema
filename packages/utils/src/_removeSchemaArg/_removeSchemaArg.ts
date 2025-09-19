import type { StandardSchemaV1 } from "@standard-schema/spec";
import { isStandardSchema } from "../isStandardSchema/isStandardSchema.ts";

export type SchemaArgs<Args extends unknown[]> =
  | Args
  | [schema: StandardSchemaV1, ...args: Args];

/**
 * Some functions take a schema as a first argument for inference purposes.
 * This function removes the schema from the arguments if it exists.
 *
 * @param args The arguments to remove the schema from.
 *
 * @returns The arguments without the schema.
 */
export function _removeSchemaArg<Args extends unknown[]>(
  args: SchemaArgs<Args>,
): Args {
  const schema = args[0];
  if (isStandardSchema(schema)) {
    return args.slice(1) as Args;
  }
  return args as Args;
}
