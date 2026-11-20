import { describe, expect, test } from "vitest";
import { stringSchema } from "../__test_fixtures/index.ts";
import { assert } from "./assert.ts";

describe("assert", () => {
  test("should not throw for valid input", () => {
    expect(() => assert(stringSchema, "hello")).not.toThrow();
  });
  test("should throw for invalid input", () => {
    expect(() => assert(stringSchema, 123)).toThrowError(
      "Expected string, got number",
    );
  });
});
