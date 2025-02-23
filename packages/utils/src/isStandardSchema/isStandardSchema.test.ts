import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expect, expectTypeOf, test } from "vitest";
import { stringSchema } from "../__test_fixtures/index.ts";
import { isStandardSchema } from "./isStandardSchema.ts";

describe("isStandardSchema", () => {
  test("should return true for standard schema", () => {
    expect(isStandardSchema(stringSchema)).toBe(true);
  });
  test("should return false for non-standard schema", () => {
    expect(isStandardSchema({ parse() {} })).toBe(false);
    expect(isStandardSchema(null)).toBe(false);
  });
  test.skip("should narrow types", () => {
    const schema = stringSchema as
      | StandardSchemaV1<string>
      | { parse(value: unknown): string };
    expectTypeOf(schema).not.toEqualTypeOf<StandardSchemaV1<string>>();
    if (isStandardSchema(schema)) {
      expectTypeOf(schema).toEqualTypeOf<StandardSchemaV1<string>>();
    }
  });
  describe("v1", () => {
    test("should return true for standard schema v1", () => {
      expect(isStandardSchema.v1(stringSchema)).toBe(true);
    });
    test("should return false for non-standard schema", () => {
      expect(isStandardSchema.v1({ parse() {} })).toBe(false);
      expect(isStandardSchema.v1(null)).toBe(false);
    });
    test("should return false for other versions", () => {
      expect(isStandardSchema.v1({ "~standard": { version: 2 } })).toBe(false);
    });
  });
});
