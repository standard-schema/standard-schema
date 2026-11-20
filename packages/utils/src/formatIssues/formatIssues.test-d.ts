import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expectTypeOf, test } from "vitest";
import { fieldsSchema } from "../__test_fixtures/index.ts";
import { formatIssues } from "./formatIssues.ts";

describe("formatIssues", () => {
  test("should infer output type from schema", () => {
    expectTypeOf(formatIssues([])).branded.toEqualTypeOf<{
      _issues: readonly string[];
    }>();

    expectTypeOf(formatIssues(fieldsSchema, [])).branded.toEqualTypeOf<{
      _issues: readonly string[];
      foo?: {
        _issues: readonly string[];
      };
      bar?: {
        _issues: readonly string[];
      };
    }>();
  });
  test("should infer output type from schema and mapper", () => {
    expectTypeOf(formatIssues([], (issue) => issue)).branded.toEqualTypeOf<{
      _issues: readonly StandardSchemaV1.Issue[];
    }>();

    expectTypeOf(
      formatIssues(fieldsSchema, [], (issue) => issue),
    ).branded.toEqualTypeOf<{
      _issues: readonly StandardSchemaV1.Issue[];
      foo?: {
        _issues: readonly StandardSchemaV1.Issue[];
      };
      bar?: {
        _issues: readonly StandardSchemaV1.Issue[];
      };
    }>();
  });
});
