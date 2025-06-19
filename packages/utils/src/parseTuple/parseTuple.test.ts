import { describe, expect, test } from "vitest";
import { asyncStringSchema, stringSchema } from "../__test_fixtures/index.ts";
import { parseTuple, parseTupleSync } from "./parseTuple.ts";

describe("parseTuple", () => {
  test("should return the parsed data", async () => {
    await expect(
      parseTuple([stringSchema, stringSchema] as const, ["hello", "world"]),
    ).resolves.toEqual(["hello", "world"]);

    await expect(
      parseTuple([asyncStringSchema, asyncStringSchema] as const, [
        "hello",
        "world",
      ]),
    ).resolves.toEqual(["hello", "world"]);
  });
  test("should throw an error if the data is invalid", async () => {
    await expect(
      parseTuple([stringSchema, stringSchema] as const, ["hello", 123]),
    ).rejects.toThrowError("Expected string, got number");

    await expect(
      parseTuple([asyncStringSchema, asyncStringSchema] as const, [
        "hello",
        123,
      ]),
    ).rejects.toThrowError("Expected string, got number");
  });
});

describe("parseTupleSync", () => {
  test("should return the parsed data", () => {
    expect(
      parseTupleSync([stringSchema, stringSchema] as const, ["hello", "world"]),
    ).toEqual(["hello", "world"]);
  });
  test("should throw an error if the data is invalid", () => {
    expect(() =>
      parseTupleSync([stringSchema, stringSchema] as const, ["hello", 123]),
    ).toThrowError("Expected string, got number");
  });
  test("should throw an error if the schema validation is asynchronous", () => {
    expect(() =>
      parseTupleSync([asyncStringSchema, asyncStringSchema] as const, [
        "hello",
        "world",
      ]),
    ).toThrowError("Schema validation must be synchronous");
  });
});
