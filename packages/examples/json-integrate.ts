/**
 * This example shows how to integrate with Standard Schemas that support JSON Schema generation.
 * It demonstrates the adapter pattern for libraries that don't natively support JSON Schema.
 */

import type { StandardJSONSchemaV1 } from "@standard-schema/spec";

import { type } from "arktype";
import * as v from "valibot";
import * as z from "zod";

// Function that accepts any compliant `StandardJSONSchemaSourceV1`
// and converts it to a JSON Schema.
export function standardConvertToJSONSchema(
  schema: StandardJSONSchemaV1,
): Record<string, unknown> | null {
  return schema["~standard"].inputSchema({
    target: "draft-2020-12",
  });
}

// Zod
standardConvertToJSONSchema(z.string());
// => { type: "string" }

// Valibot (with side-effect import)
import "valibot/to-json-schema"; // adds JSON Schema conversion methods
standardConvertToJSONSchema(v.string());
// => { type: "string" }

// ArkType
standardConvertToJSONSchema(type("string"));
// => { type: "string" }
