import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expectTypeOf, test } from "vitest";
import { stringSchema } from "../__test_fixtures/index.ts";
import { safeParseTuple, safeParseTupleSync } from "./safeParseTuple.ts";

describe("safeParseTuple", () => {
  test("should infer output type from schema", () => {
    expectTypeOf(
      safeParseTuple([stringSchema, stringSchema] as const, ["hello", "world"]),
    ).toEqualTypeOf<Promise<StandardSchemaV1.Result<[string, string]>>>();
  });
  test("requires data to be an array", () => {
    safeParseTuple(
      [stringSchema, stringSchema] as const,
      // @ts-expect-error data must be an array
      "hello",
    );
  });
});

describe("safeParseTupleSync", () => {
  test("should infer output type from schema", () => {
    expectTypeOf(
      safeParseTupleSync([stringSchema, stringSchema] as const, [
        "hello",
        "world",
      ]),
    ).toEqualTypeOf<StandardSchemaV1.Result<[string, string]>>();
  });
  test("requires data to be an array", () => {
    safeParseTupleSync(
      [stringSchema, stringSchema] as const,
      // @ts-expect-error data must be an array
      "hello",
    );
  });
});
