import { describe, expectTypeOf, test } from "vitest";
import {
  stringSchema,
  stringToNumberSchema,
} from "../__test_fixtures/index.ts";
import { assert } from "./assert.ts";

describe("assert", () => {
  test("should narrow variable to input type", () => {
    const value = "hello" as string | number;
    if (Math.random()) {
      assert(stringSchema, value);
      expectTypeOf(value).toEqualTypeOf<string>();
    }
    if (Math.random()) {
      assert(stringToNumberSchema, value);
      expectTypeOf(value).toEqualTypeOf<string>();
    }
  });
});
