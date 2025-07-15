import { describe, expectTypeOf, test } from "vitest";
import { stringSchema } from "../__test_fixtures/index.ts";
import { parse, parseSync } from "./parse.ts";

describe("parse", () => {
  test("should infer output type from schema", () => {
    expectTypeOf(parse(stringSchema, "hello")).toEqualTypeOf<Promise<string>>();
  });
});

describe("parseSync", () => {
  test("should infer output type from schema", () => {
    expectTypeOf(parseSync(stringSchema, "hello")).toEqualTypeOf<string>();
  });
});
