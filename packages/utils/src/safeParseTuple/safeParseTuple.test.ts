import { describe, expect, test } from "vitest";
import { asyncStringSchema, stringSchema } from "../__test_fixtures/index.ts";
import { safeParseTuple, safeParseTupleSync } from "./safeParseTuple.ts";

describe("safeParseTuple", () => {
  test("should return a result object", async () => {
    await expect(
      safeParseTuple([stringSchema, stringSchema] as const, ["hello", "world"]),
    ).resolves.toEqual({
      value: ["hello", "world"],
    });

    await expect(
      safeParseTuple([asyncStringSchema, asyncStringSchema] as const, [
        "hello",
        "world",
      ]),
    ).resolves.toEqual({
      value: ["hello", "world"],
    });
  });
  test("should return a result object with issues", async () => {
    await expect(
      safeParseTuple([stringSchema, stringSchema] as const, ["hello", 123]),
    ).resolves.toEqual({
      issues: [
        {
          message: "Expected string, got number",
          path: [1],
        },
      ],
    });

    await expect(
      safeParseTuple([asyncStringSchema, asyncStringSchema] as const, [
        "hello",
        123,
      ]),
    ).resolves.toEqual({
      issues: [
        {
          message: "Expected string, got number",
          path: [1],
        },
      ],
    });
  });
});

describe("safeParseTupleSync", () => {
  test("should return a result object", () => {
    expect(
      safeParseTupleSync([stringSchema, stringSchema] as const, [
        "hello",
        "world",
      ]),
    ).toEqual({
      value: ["hello", "world"],
    });
  });
  test("should return a result object with issues", () => {
    expect(
      safeParseTupleSync([stringSchema, stringSchema] as const, ["hello", 123]),
    ).toEqual({
      issues: [
        {
          message: "Expected string, got number",
          path: [1],
        },
      ],
    });
  });
});
