import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expectTypeOf, test } from "vitest";
import type {
  StandardSchemaV1Dictionary,
  StandardSchemaV1Tuple,
} from "./StandardSchemaDictionary.ts";

// intentionally declared with interfaces, to check the type doesn't require an index signature
interface Input {
  foo: string;
  bar: number;
}

interface Output {
  foo: number;
  bar: string;
}

type TSchemas = {
  foo: StandardSchemaV1<string, number>;
  bar: StandardSchemaV1<number, string>;
};

interface ISchemas {
  foo: StandardSchemaV1<string, number>;
  bar: StandardSchemaV1<number, string>;
}

describe("StandardSchemaV1Dictionary", () => {
  test("should describe schema dictionary", () => {
    expectTypeOf<StandardSchemaV1Dictionary>().toEqualTypeOf<
      Record<string, StandardSchemaV1>
    >();
    expectTypeOf<StandardSchemaV1Dictionary<Input, Output>>().toEqualTypeOf<{
      foo: StandardSchemaV1<string, number>;
      bar: StandardSchemaV1<number, string>;
    }>();
  });
  test("should infer input type from schema", () => {
    expectTypeOf<
      StandardSchemaV1Dictionary.InferInput<TSchemas>
    >().toEqualTypeOf<Input>();

    expectTypeOf<
      // @ts-expect-error doesn't work with interfaces without index signature :(
      StandardSchemaV1Dictionary.InferInput<ISchemas>
    >().toEqualTypeOf<Input>();
  });
  test("should infer output type from schema", () => {
    expectTypeOf<
      StandardSchemaV1Dictionary.InferOutput<TSchemas>
    >().toEqualTypeOf<Output>();

    expectTypeOf<
      // @ts-expect-error doesn't work with interfaces without index signature :(
      StandardSchemaV1Dictionary.InferOutput<ISchemas>
    >().toEqualTypeOf<Output>();
  });
});

describe("StandardSchemaV1Tuple", () => {
  test("should describe schema tuple", () => {
    expectTypeOf<StandardSchemaV1Tuple>().toEqualTypeOf<StandardSchemaV1[]>();
    expectTypeOf<
      StandardSchemaV1Tuple<[string, number], [number, string]>
    >().toEqualTypeOf<
      [StandardSchemaV1<string, number>, StandardSchemaV1<number, string>]
    >();
  });
  test("should infer input type from schema", () => {
    expectTypeOf<
      StandardSchemaV1Tuple.InferInput<
        [StandardSchemaV1<string, number>, StandardSchemaV1<number, string>]
      >
    >().toEqualTypeOf<[string, number]>();
  });
  test("should infer output type from schema", () => {
    expectTypeOf<
      StandardSchemaV1Tuple.InferOutput<
        [StandardSchemaV1<string, number>, StandardSchemaV1<number, string>]
      >
    >().toEqualTypeOf<[number, string]>();
  });
});
