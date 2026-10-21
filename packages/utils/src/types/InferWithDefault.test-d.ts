import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expectTypeOf, test } from "vitest";
import type {
  InferInputWithDefault,
  InferOutputWithDefault,
} from "./InferWithDefault.ts";

describe("InferInputWithDefault", () => {
  test("should infer input type from schema", () => {
    expectTypeOf<
      InferInputWithDefault<StandardSchemaV1<string, number>, never>
    >().toEqualTypeOf<string>();
  });
  test("should be default type if not schema", () => {
    expectTypeOf<
      InferInputWithDefault<undefined, string>
    >().toEqualTypeOf<string>();
  });
});

describe("InferOutputWithDefault", () => {
  test("should infer output type from schema", () => {
    expectTypeOf<
      InferOutputWithDefault<StandardSchemaV1<string, number>, never>
    >().toEqualTypeOf<number>();
  });
  test("should be default type if not schema", () => {
    expectTypeOf<
      InferOutputWithDefault<undefined, string>
    >().toEqualTypeOf<string>();
  });
});
