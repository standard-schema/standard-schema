import { describe, expect, test } from "vitest";
import { stringSchema } from "../__test_fixtures/index.ts";
import { _removeSchemaArg } from "./_removeSchemaArg.ts";

describe("_removeSchemaArg", () => {
  const withoutSchema = ["foo", "bar"];
  test("should return the arguments without the schema", () => {
    expect(_removeSchemaArg([stringSchema, ...withoutSchema])).toStrictEqual(
      withoutSchema,
    );
  });
  test("should return the arguments if no schema is passed", () => {
    expect(_removeSchemaArg(withoutSchema)).toBe(withoutSchema);
  });
});
