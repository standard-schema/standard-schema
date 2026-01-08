import { describe, expect, test } from "vitest";
import { asyncStringSchema, stringSchema } from "../__test_fixtures/index.ts";
import { parse, parseSync } from "./parse.ts";

describe("parse", () => {
  test("should return the parsed data", async () => {
    await expect(parse(stringSchema, "hello")).resolves.toBe("hello");

    await expect(parse(asyncStringSchema, "hello")).resolves.toBe("hello");
  });
  test("should throw an error if the data is invalid", async () => {
    await expect(parse(stringSchema, 123)).rejects.toThrowError(
      "Expected string, got number",
    );

    await expect(parse(asyncStringSchema, 123)).rejects.toThrowError(
      "Expected string, got number",
    );
  });
});

describe("parseSync", () => {
  test("should return the parsed data", () => {
    expect(parseSync(stringSchema, "hello")).toBe("hello");
  });
  test("should throw an error if the data is invalid", () => {
    expect(() => parseSync(stringSchema, 123)).toThrowError(
      "Expected string, got number",
    );
  });
  test("should throw an error if the schema validation is asynchronous", () => {
    expect(() => parseSync(asyncStringSchema, "hello")).toThrowError(
      "Schema validation must be synchronous",
    );
  });
});
