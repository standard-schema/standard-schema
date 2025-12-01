/**
 * This example shows how to integrate with Standard Schemas that support JSON Schema generation.
 * It demonstrates the adapter pattern for libraries that don't natively support JSON Schema.
 */

import type { StandardJSONSchemaV1 } from "@standard-schema/spec";

// Function that accepts any compliant `StandardJSONSchemaSourceV1`
// and converts it to a JSON Schema.
export function acceptStandardJSONSchema(
  schema: StandardJSONSchemaV1,
): Record<string, unknown> {
  return schema["~standard"].jsonSchema.input({
    target: "draft-2020-12",
  });
}

/**
 * Example using sample schema from `json-implement.ts`
 * */
import { stringWithJSON } from "./json-implement.ts";

const compliantSchema = stringWithJSON();
acceptStandardJSONSchema(compliantSchema);

/**
 * Zod & Zod Mini examples
 */
import * as z from "zod";
import * as zm from "zod/mini";

acceptStandardJSONSchema(z.string());
acceptStandardJSONSchema(zm.toJSONSchema(zm.string()));

/**
 * Valibot example
 */
import { toJsonSchema } from "@valibot/to-json-schema"; // adds JSON Schema conversion methods

acceptStandardJSONSchema(toJsonSchema(v.string()));

/**
 * ArkType example
 */
import { type } from "arktype";

acceptStandardJSONSchema(type("string"));
