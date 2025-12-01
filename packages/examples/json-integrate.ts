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
export function acceptStandardJSONSchema(
  schema: StandardJSONSchemaV1,
): Record<string, unknown> {
  return schema["~standard"].jsonSchema.input({
    target: "draft-2020-12",
  });
}

// sample schema
import { stringWithJSON } from "./json-implement.ts";

const compliantSchema = stringWithJSON();
acceptStandardJSONSchema(compliantSchema);

// Zod
import * as z from "zod";

acceptStandardJSONSchema(z.string());

import * as zm from "zod/mini";

acceptStandardJSONSchema(zm.toJSONSchema(zm.string()));

// Valibot
import { toJsonSchema } from "@valibot/to-json-schema"; // adds JSON Schema conversion methods

acceptStandardJSONSchema(toJsonSchema(v.string()));

// ArkType
acceptStandardJSONSchema(type("string"));
