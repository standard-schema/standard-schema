import { describe, expect, test } from "vitest";
import { asyncStringSchema, stringSchema } from "../__test_fixtures/index.ts";
import { parseDictionary, parseDictionarySync } from "./parseDictionary.ts";

describe("parseDictionary", () => {
  test("should return the parsed data", async () => {
    await expect(
      parseDictionary(
        {
          foo: stringSchema,
          bar: stringSchema,
        },
        {
          foo: "hello",
          bar: "world",
        },
      ),
    ).resolves.toEqual({
      foo: "hello",
      bar: "world",
    });

    await expect(
      parseDictionary(
        {
          foo: asyncStringSchema,
          bar: asyncStringSchema,
        },
        {
          foo: "hello",
          bar: "world",
        },
      ),
    ).resolves.toEqual({
      foo: "hello",
      bar: "world",
    });
  });
  test("should throw an error if the data is invalid", async () => {
    await expect(
      parseDictionary(
        {
          foo: stringSchema,
          bar: stringSchema,
        },
        {
          foo: "hello",
          bar: 123,
        },
      ),
    ).rejects.toThrowError("Expected string, got number");

    await expect(
      parseDictionary(
        {
          foo: asyncStringSchema,
          bar: asyncStringSchema,
        },
        {
          foo: "hello",
          bar: 123,
        },
      ),
    ).rejects.toThrowError("Expected string, got number");
  });
});

describe("parseDictionarySync", () => {
  test("should return the parsed data", () => {
    expect(
      parseDictionarySync(
        {
          foo: stringSchema,
          bar: stringSchema,
        },
        {
          foo: "hello",
          bar: "world",
        },
      ),
    ).toEqual({
      foo: "hello",
      bar: "world",
    });
  });
  test("should throw an error if the data is invalid", () => {
    expect(() =>
      parseDictionarySync(
        {
          foo: stringSchema,
          bar: stringSchema,
        },
        {
          foo: "hello",
          bar: 123,
        },
      ),
    ).toThrowError("Expected string, got number");
  });
  test("should throw an error if the schema validation is asynchronous", () => {
    expect(() =>
      parseDictionarySync(
        {
          foo: asyncStringSchema,
          bar: asyncStringSchema,
        },
        {
          foo: "hello",
          bar: "world",
        },
      ),
    ).toThrowError("Schema validation must be synchronous");
  });
});
