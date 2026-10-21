import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expectTypeOf, test } from "vitest";
import { stringSchema } from "../__test_fixtures/index.ts";
import { safeParse, safeParseSync } from "./safeParse.ts";

describe("safeParse", () => {
  test("should infer output type from schema", () => {
    expectTypeOf(safeParse(stringSchema, "hello")).toEqualTypeOf<
      Promise<StandardSchemaV1.Result<string>>
    >();
  });
});

describe("safeParseSync", () => {
  test("should infer output type from schema", () => {
    expectTypeOf(safeParseSync(stringSchema, "hello")).toEqualTypeOf<
      StandardSchemaV1.Result<string>
    >();
  });
});
