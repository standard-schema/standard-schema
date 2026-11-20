import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expectTypeOf, test } from "vitest";
import { fieldsSchema } from "../__test_fixtures/index.ts";
import { flattenIssues } from "./flattenIssues.ts";

describe("flattenIssues", () => {
  test("should infer output type from schema", () => {
    expectTypeOf(flattenIssues([])).toEqualTypeOf<{
      formIssues: readonly string[];
      fieldIssues: Partial<Record<never, readonly string[]>>;
    }>();

    expectTypeOf(flattenIssues(fieldsSchema, [])).toEqualTypeOf<{
      formIssues: readonly string[];
      fieldIssues: Partial<Record<"foo" | "bar", readonly string[]>>;
    }>();
  });
  test("should infer output type from schema and mapper", () => {
    expectTypeOf(flattenIssues([], (issue) => issue)).toEqualTypeOf<{
      formIssues: readonly StandardSchemaV1.Issue[];
      fieldIssues: Partial<Record<never, readonly StandardSchemaV1.Issue[]>>;
    }>();

    expectTypeOf(
      flattenIssues(fieldsSchema, [], (issue) => issue),
    ).toEqualTypeOf<{
      formIssues: readonly StandardSchemaV1.Issue[];
      fieldIssues: Partial<
        Record<"foo" | "bar", readonly StandardSchemaV1.Issue[]>
      >;
    }>();
  });
});
