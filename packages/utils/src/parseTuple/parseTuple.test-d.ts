import { describe, expectTypeOf, test } from "vitest";
import { stringSchema } from "../__test_fixtures/index.ts";
import { parseTuple, parseTupleSync } from "./parseTuple.ts";

describe("parseTuple", () => {
  test("should infer output type from schema", () => {
    expectTypeOf(
      parseTuple([stringSchema, stringSchema] as const, ["hello", "world"]),
    ).toEqualTypeOf<Promise<[string, string]>>();
  });
  test("requires data to be an array", () => {
    parseTuple(
      [stringSchema, stringSchema] as const,
      // @ts-expect-error data must be an array
      "hello",
    );
  });
});

describe("parseTupleSync", () => {
  test("should infer output type from schema", () => {
    expectTypeOf(
      parseTupleSync([stringSchema, stringSchema] as const, ["hello", "world"]),
    ).toEqualTypeOf<[string, string]>();
  });
  test("requires data to be an array", () => {
    parseTupleSync(
      [stringSchema, stringSchema] as const,
      // @ts-expect-error data must be an array
      "hello",
    );
  });
});
