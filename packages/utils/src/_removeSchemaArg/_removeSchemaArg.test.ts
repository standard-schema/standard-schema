import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expect, test } from "vitest";
import { _removeSchemaArg } from "./_removeSchemaArg.ts";

describe("_removeSchemaArg", () => {
  const schema: StandardSchemaV1 = {
    "~standard": {
      vendor: "custom",
      version: 1,
      validate: () => ({ issues: [] }),
    },
  };
  const withoutSchema = ["foo", "bar"];
  test("should return the arguments without the schema", () => {
    expect(_removeSchemaArg([schema, ...withoutSchema])).toStrictEqual(
      withoutSchema,
    );
  });
  test("should return the arguments if no schema is passed", () => {
    expect(_removeSchemaArg(withoutSchema)).toBe(withoutSchema);
  });
});
