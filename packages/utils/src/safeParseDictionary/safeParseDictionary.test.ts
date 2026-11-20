import { describe, expect, test } from "vitest";
import { asyncStringSchema, stringSchema } from "../__test_fixtures/index.ts";
import {
  safeParseDictionary,
  safeParseDictionarySync,
} from "./safeParseDictionary.ts";

describe("safeParseDictionary", () => {
  test("should return a result object", async () => {
    await expect(
      safeParseDictionary(
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
      value: {
        foo: "hello",
        bar: "world",
      },
    });

    await expect(
      safeParseDictionary(
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
      value: {
        foo: "hello",
        bar: "world",
      },
    });
  });
  test("should return a result object with issues", async () => {
    await expect(
      safeParseDictionary(
        {
          foo: stringSchema,
          bar: stringSchema,
        },
        {
          foo: "hello",
          bar: 123,
        },
      ),
    ).resolves.toEqual({
      issues: [
        {
          message: "Expected string, got number",
          path: ["bar"],
        },
      ],
    });

    await expect(
      safeParseDictionary(
        {
          foo: asyncStringSchema,
          bar: asyncStringSchema,
        },
        {
          foo: "hello",
          bar: 123,
        },
      ),
    ).resolves.toEqual({
      issues: [
        {
          message: "Expected string, got number",
          path: ["bar"],
        },
      ],
    });
  });
});

describe("safeParseDictionarySync", () => {
  test("should return a result object", () => {
    expect(
      safeParseDictionarySync(
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
      value: {
        foo: "hello",
        bar: "world",
      },
    });
  });
  test("should return a result object with issues", () => {
    expect(
      safeParseDictionarySync(
        {
          foo: stringSchema,
          bar: stringSchema,
        },
        {
          foo: "hello",
          bar: 123,
        },
      ),
    ).toEqual({
      issues: [
        {
          message: "Expected string, got number",
          path: ["bar"],
        },
      ],
    });
  });
  test("should throw an error if the schema validation is asynchronous", () => {
    expect(() =>
      safeParseDictionarySync(
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
