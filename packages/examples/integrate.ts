/**
 * This is an example showing how to accept Standard Schemas in a generic way.
 */

import type { StandardSchemaV1 } from "@standard-schema/spec";

import * as z from "zod";
import * as v from "valibot";
import { type } from "arktype";

export async function standardValidate<T extends StandardSchemaV1>(
  schema: T,
  input: StandardSchemaV1.InferInput<T>,
): Promise<StandardSchemaV1.InferOutput<T>> {
  let result = schema["~standard"].validate(input);
  if (result instanceof Promise) result = await result;

  // if the `issues` field exists, the validation failed
  if ("issues" in result) {
    throw new Error(JSON.stringify(result.issues, null, 2));
  }

  return result.value;
}

const zodResult = await standardValidate(z.string(), "hello");
const valibotResult = await standardValidate(v.string(), "hello");
const arktypeResult = await standardValidate(type("string"), "hello");

console.log({
  zodResult,
  valibotResult,
  arktypeResult,
});
