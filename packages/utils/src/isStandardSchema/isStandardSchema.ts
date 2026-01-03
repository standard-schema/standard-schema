import type { StandardSchemaV1 } from "@standard-schema/spec";

// check for any version
export function isStandardSchema(schema: unknown): schema is StandardSchemaV1;
// check for specific version
export function isStandardSchema(
	schema: unknown,
	version: 1,
): schema is StandardSchemaV1;
export function isStandardSchema(
	// biome-ignore lint/suspicious/noExplicitAny: we don't want to typeof check the schema itself - only the ~standard property (schemas can be objects or functions, for example)
	schema: any,
	version?: number,
): schema is StandardSchemaV1 {
	if (schema == null) return false;
	const standardProps = schema["~standard"];
	const baseConditions =
		typeof standardProps === "object" &&
		standardProps != null &&
		typeof standardProps.validate === "function" &&
		typeof standardProps.version === "number" &&
		typeof standardProps.vendor === "string";
	return version == null
		? baseConditions
		: baseConditions && standardProps.version === version;
}
