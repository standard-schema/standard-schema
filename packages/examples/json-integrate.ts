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
): Record<string, unknown> {
  return schema["~standard"].jsonSchema.input({
    target: "draft-2020-12",
  });
}

// sample schema
import { stringWithJSON } from "./json-implement.ts";
const compliantSchema = stringWithJSON();
standardConvertToJSONSchema(compliantSchema);

// Zod
standardConvertToJSONSchema(z.string());
// => { type: "string" }

// Valibot
import { toJsonSchema } from "@valibot/to-json-schema"; // adds JSON Schema conversion methods
standardConvertToJSONSchema(toJsonSchema(v.string()));
// => { type: "string" }

// ArkType
standardConvertToJSONSchema(type("string"));
// => { type: "string" }
