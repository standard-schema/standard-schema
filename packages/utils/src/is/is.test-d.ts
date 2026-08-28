import { describe, expectTypeOf, test } from "vitest";
import {
  stringSchema,
  stringToNumberSchema,
} from "../__test_fixtures/index.ts";
import { is } from "./is.ts";

describe("is", () => {
  test("should narrow variable to input type", () => {
    const value = "hello" as string | number;
    if (is(stringSchema, value)) {
      expectTypeOf(value).toEqualTypeOf<string>();
    }
    if (is(stringToNumberSchema, value)) {
      expectTypeOf(value).toEqualTypeOf<string>();
    }
  });
});
