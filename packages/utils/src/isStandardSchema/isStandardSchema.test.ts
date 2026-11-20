import { describe, expect, test } from "vitest";
import { stringSchema } from "../__test_fixtures/index.ts";
import { isStandardSchema } from "./isStandardSchema.ts";

describe("isStandardSchema", () => {
  test("should return true for standard schema", () => {
    expect(isStandardSchema(stringSchema)).toBe(true);
  });
  test("should return false for non-standard schema", () => {
    expect(isStandardSchema({ parse() {} })).toBe(false);
    expect(isStandardSchema(null)).toBe(false);
    expect(isStandardSchema({ "~standard": null })).toBe(false);
  });
  test("should return false for ~standard without validate", () => {
    expect(
      isStandardSchema({
        "~standard": {
          version: 1,
          vendor: "custom",
          jsonSchema: {
            input() {
              return {};
            },
            output() {
              return {};
            },
          },
        },
      }),
    ).toBe(false);
  });
  describe("check version", () => {
    test("should return true for standard schema v1", () => {
      expect(isStandardSchema(stringSchema, 1)).toBe(true);
    });
    test("should return false for non-standard schema", () => {
      expect(isStandardSchema({ parse() {} }, 1)).toBe(false);
      expect(isStandardSchema(null, 1)).toBe(false);
    });
    test("should return false for other versions", () => {
      expect(isStandardSchema({ "~standard": { version: 2 } }, 1)).toBe(false);
    });
    test("should return false for ~standard without validate", () => {
      expect(
        isStandardSchema(
          {
            "~standard": {
              version: 1,
              vendor: "custom",
              jsonSchema: {
                input() {
                  return {};
                },
                output() {
                  return {};
                },
              },
            },
          },
          1,
        ),
      ).toBe(false);
    });
  });
});
