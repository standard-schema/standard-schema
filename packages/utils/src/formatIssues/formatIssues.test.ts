import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expect, expectTypeOf, test } from "vitest";
import type { Fields } from "../__test_fixtures/index.ts";
import { fieldsSchema } from "../__test_fixtures/index.ts";
import type { FormattedIssues } from "./formatIssues.ts";
import { formatIssues } from "./formatIssues.ts";

describe("formatIssues", () => {
  test("should return empty object if no issues are passed", () => {
    const expected = {
      _issues: [],
    };
    expect(formatIssues([])).toStrictEqual(expected);
    expect(formatIssues(fieldsSchema, [])).toStrictEqual(expected);

    // biome-ignore lint/correctness/noConstantCondition: type-only tests
    if (0 > 1) {
      expectTypeOf(formatIssues([])).toEqualTypeOf<FormattedIssues<unknown>>();

      expectTypeOf(formatIssues(fieldsSchema, [])).toEqualTypeOf<
        FormattedIssues<Fields>
      >();
    }
  });
  test("should return form errors if issues have no path", () => {
    const issues = [
      { message: "Error message 1" },
      { message: "Error message 2" },
    ];
    const expected = {
      _issues: ["Error message 1", "Error message 2"],
    };
    expect(formatIssues(issues)).toStrictEqual(expected);
    expect(formatIssues(fieldsSchema, issues)).toStrictEqual(expected);
  });
  test("should return field errors if issues have path", () => {
    const issues = [
      { message: "Error message 1", path: ["foo"] },
      { message: "Error message 2", path: ["bar"] },
    ];
    const expected = {
      _issues: [],
      foo: {
        _issues: ["Error message 1"],
      },
      bar: {
        _issues: ["Error message 2"],
      },
    };
    expect(formatIssues(issues)).toStrictEqual(expected);
    expect(formatIssues(fieldsSchema, issues)).toStrictEqual(expected);
  });
  test("allows mapping issues", () => {
    const issues = [{ message: "a", path: ["foo"] }, { message: "ab" }];
    const mapper = (issue: StandardSchemaV1.Issue) => issue;

    const expected = {
      _issues: [issues[1]],
      foo: {
        _issues: [issues[0]],
      },
    };

    expect(formatIssues(issues, mapper)).toStrictEqual(expected);
    expect(formatIssues(fieldsSchema, issues, mapper)).toStrictEqual(expected);

    // biome-ignore lint/correctness/noConstantCondition: type-only tests
    if (0 > 1) {
      expectTypeOf(formatIssues(issues, mapper)).toEqualTypeOf<
        FormattedIssues<unknown, StandardSchemaV1.Issue>
      >();

      expectTypeOf(formatIssues(fieldsSchema, issues, mapper)).toEqualTypeOf<
        FormattedIssues<Fields, StandardSchemaV1.Issue>
      >();
    }
  });
});
