import { describe, expect, test } from "vitest";
import { asyncStringSchema, stringSchema } from "../__test_fixtures/index.ts";
import { safeParse, safeParseSync } from "./safeParse.ts";

describe("safeParse", () => {
  test("should return a result object", async () => {
    await expect(safeParse(stringSchema, "hello")).resolves.toEqual({
      value: "hello",
    });

    await expect(safeParse(asyncStringSchema, "hello")).resolves.toEqual({
      value: "hello",
    });
  });
  test("should return a result object with issues", async () => {
    await expect(safeParse(stringSchema, 123)).resolves.toEqual({
      issues: [{ message: "Expected string, got number", path: [] }],
    });

    await expect(safeParse(asyncStringSchema, 123)).resolves.toEqual({
      issues: [{ message: "Expected string, got number", path: [] }],
    });
  });
});

describe("safeParseSync", () => {
  test("should return a result object", () => {
    expect(safeParseSync(stringSchema, "hello")).toEqual({
      value: "hello",
    });
  });
  test("should return a result object with issues", () => {
    expect(safeParseSync(stringSchema, 123)).toEqual({
      issues: [{ message: "Expected string, got number", path: [] }],
    });
  });
  test("should throw an error if the schema validation is asynchronous", () => {
    expect(() => safeParseSync(asyncStringSchema, "hello")).toThrowError(
      "Schema validation must be synchronous",
    );
  });
});
