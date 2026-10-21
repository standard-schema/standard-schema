import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expectTypeOf, test } from "vitest";
import { stringSchema } from "../__test_fixtures/index.ts";
import {
  safeParseDictionary,
  safeParseDictionarySync,
} from "./safeParseDictionary.ts";

describe("safeParseDictionary", () => {
  test("should infer output type from schema", () => {
    expectTypeOf(
      safeParseDictionary(
        {
          foo: stringSchema,
          bar: stringSchema,
        },
        {},
      ),
    ).toEqualTypeOf<
      Promise<StandardSchemaV1.Result<{ foo: string; bar: string }>>
    >();
  });
  test("requires data to be an object", () => {
    safeParseDictionary(
      {
        foo: stringSchema,
        bar: stringSchema,
      },
      // @ts-expect-error data must be an object
      "hello",
    );
    // {} is treated as "not nullish" so this is allowed
    safeParseDictionary({}, "");
  });
});

describe("safeParseDictionarySync", () => {
  test("should infer output type from schema", () => {
    expectTypeOf(
      safeParseDictionarySync(
        {
          foo: stringSchema,
          bar: stringSchema,
        },
        {},
      ),
    ).toEqualTypeOf<StandardSchemaV1.Result<{ foo: string; bar: string }>>();
  });
  test("requires data to be an object", () => {
    safeParseDictionarySync(
      {
        foo: stringSchema,
        bar: stringSchema,
      },
      // @ts-expect-error data must be an object
      "hello",
    );
    // {} is treated as "not nullish" so this is allowed
    safeParseDictionarySync({}, "");
  });
});
