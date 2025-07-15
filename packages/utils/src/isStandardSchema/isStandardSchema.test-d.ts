import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expectTypeOf, test } from "vitest";
import { stringSchema } from "../__test_fixtures/index.ts";
import { isStandardSchema } from "./isStandardSchema.ts";

describe("isStandardSchema", () => {
  test("should narrow types from unknown", () => {
    const maybeSchema: unknown = stringSchema;
    if (isStandardSchema(maybeSchema)) {
      expectTypeOf(maybeSchema).toEqualTypeOf<StandardSchemaV1>();
    }
  });
  test("should narrow types from known", () => {
    const maybeSchema = stringSchema as
      | StandardSchemaV1<string>
      | { parse(value: unknown): string };
    if (isStandardSchema(maybeSchema)) {
      expectTypeOf(maybeSchema).toEqualTypeOf<StandardSchemaV1<string>>();
    }
  });
});
