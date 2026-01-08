import type { StandardJSONSchemaV1 } from "@standard-schema/spec";
import { describe, expectTypeOf, test } from "vitest";
import { stringJsonSchema } from "../__test_fixtures/index.ts";
import { isStandardJsonSchema } from "./isStandardJsonSchema.ts";

describe("isStandardJsonSchema", () => {
  test("should narrow types from unknown", () => {
    const maybeSchema: unknown = stringJsonSchema;
    if (isStandardJsonSchema(maybeSchema)) {
      expectTypeOf(maybeSchema).toEqualTypeOf<StandardJSONSchemaV1>();
    }
  });
  test("should narrow types from unknown with version", () => {
    const maybeSchema: unknown = stringJsonSchema;
    if (isStandardJsonSchema(maybeSchema, 1)) {
      expectTypeOf(maybeSchema).toEqualTypeOf<StandardJSONSchemaV1>();
    }
  });
  test("should narrow types from known", () => {
    const maybeSchema = stringJsonSchema as
      | StandardJSONSchemaV1<string>
      | { parse(value: unknown): string };
    if (isStandardJsonSchema(maybeSchema)) {
      expectTypeOf(maybeSchema).toEqualTypeOf<StandardJSONSchemaV1<string>>();
    }
  });
  test("should narrow types from known with version", () => {
    const maybeSchema = stringJsonSchema as
      | StandardJSONSchemaV1<string>
      | { parse(value: unknown): string };
    if (isStandardJsonSchema(maybeSchema, 1)) {
      expectTypeOf(maybeSchema).toEqualTypeOf<StandardJSONSchemaV1<string>>();
    }
  });
});
