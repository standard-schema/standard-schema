import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expect, expectTypeOf, test } from "vitest";
import type { FlattenedIssues } from "./flattenIssues.ts";
import { flattenIssues } from "./flattenIssues.ts";

describe("flattenIssues", () => {
  interface Fields {
    foo: string;
    bar: number;
  }
  const schema: StandardSchemaV1<Fields> = {
    "~standard": {
      vendor: "custom",
      version: 1,
      validate: () => ({ issues: [] }),
    },
  };
  test("should return empty object if no issues are passed", () => {
    const expected = {
      formIssues: [],
      fieldIssues: {},
    };
    expect(flattenIssues([])).toStrictEqual(expected);

    expect(flattenIssues(schema, [])).toStrictEqual(expected);

    // biome-ignore lint/correctness/noConstantCondition: type-only tests
    if (0 > 1) {
      expectTypeOf(flattenIssues([])).toEqualTypeOf<FlattenedIssues<unknown>>();

      expectTypeOf(flattenIssues(schema, [])).toEqualTypeOf<
        FlattenedIssues<Fields>
      >();
    }
  });

  test("should return form errors if issues have no path", () => {
    const issues = [
      { message: "Error message 1" },
      { message: "Error message 2" },
    ];
    const expected = {
      formIssues: ["Error message 1", "Error message 2"],
      fieldIssues: {},
    };
    expect(flattenIssues(issues)).toStrictEqual(expected);

    expect(flattenIssues(schema, issues)).toStrictEqual(expected);
  });

  test("should return field errors if issues have path", () => {
    const issues = [
      { message: "Error message 1", path: ["foo"] },
      { message: "Error message 2", path: ["bar"] },
    ];
    const expected = {
      formIssues: [],
      fieldIssues: {
        foo: ["Error message 1"],
        bar: ["Error message 2"],
      },
    };
    expect(flattenIssues(issues)).toStrictEqual(expected);

    expect(flattenIssues(schema, issues)).toStrictEqual(expected);
  });
  test("allows mapping issues", () => {
    const issues = [{ message: "a", path: ["foo"] }, { message: "ab" }];
    const mapper = (issue: StandardSchemaV1.Issue) => issue;

    const expected = {
      formIssues: [issues[1]],
      fieldIssues: {
        foo: [issues[0]],
      },
    };

    expect(flattenIssues(issues, mapper)).toStrictEqual(expected);

    expect(flattenIssues(schema, issues, mapper)).toStrictEqual(expected);

    // biome-ignore lint/correctness/noConstantCondition: type-only tests
    if (0 > 1) {
      expectTypeOf(flattenIssues(issues, mapper)).toEqualTypeOf<
        FlattenedIssues<unknown, StandardSchemaV1.Issue>
      >();

      expectTypeOf(flattenIssues(schema, issues, mapper)).toEqualTypeOf<
        FlattenedIssues<Fields, StandardSchemaV1.Issue>
      >();
    }
  });
});
