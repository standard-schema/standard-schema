import { describe, expect, test } from "vitest";
import { stringSchema } from "../__test_fixtures/index.ts";
import { is } from "./is.ts";

describe("is", () => {
  test("should return true for valid input", () => {
    expect(is(stringSchema, "hello")).toBe(true);
  });
  test("should return false for invalid input", () => {
    expect(is(stringSchema, 123)).toBe(false);
  });
});
