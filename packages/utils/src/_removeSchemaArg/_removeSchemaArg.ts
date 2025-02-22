import type { StandardSchemaV1 } from "@standard-schema/spec";

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
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  if ((schema as any)?.["~standard"]) {
    return args.slice(1) as never;
  }
  return args as Args;
}
