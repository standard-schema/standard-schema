import { describe, expectTypeOf, test } from "vitest";
import { stringSchema } from "../__test_fixtures/index.ts";
import { parseDictionary, parseDictionarySync } from "./parseDictionary.ts";

describe("parseDictionary", () => {
  test("should infer output type from schema", () => {
    expectTypeOf(
      parseDictionary(
        {
          foo: stringSchema,
          bar: stringSchema,
        },
        {},
      ),
    ).toEqualTypeOf<Promise<{ foo: string; bar: string }>>();
  });
  test("requires data to be an object", () => {
    parseDictionary(
      {
        foo: stringSchema,
        bar: stringSchema,
      },
      // @ts-expect-error data must be an object
      "hello",
    );
    // {} is treated as "not nullish" so this is allowed
    parseDictionary({}, "");
  });
});

describe("parseDictionarySync", () => {
  test("should infer output type from schema", () => {
    expectTypeOf(
      parseDictionarySync(
        {
          foo: stringSchema,
          bar: stringSchema,
        },
        {},
      ),
    ).toEqualTypeOf<{ foo: string; bar: string }>();
  });
  test("requires data to be an object", () => {
    parseDictionarySync(
      {
        foo: stringSchema,
        bar: stringSchema,
      },
      // @ts-expect-error data must be an object
      "hello",
    );
    // {} is treated as "not nullish" so this is allowed
    parseDictionarySync({}, "");
  });
});
