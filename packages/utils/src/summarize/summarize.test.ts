import { describe, expect, test } from "vitest";
import { summarize } from "./summarize.ts";

describe("summarize", () => {
  test("should return empty string if no issues are passed", () => {
    expect(summarize([])).toBe("");
  });

  test("should return single error without path", () => {
    expect(
      summarize([
        { message: "Invalid type: Expected string but received 123" },
      ]),
    ).toMatchInlineSnapshot(
      `"× Invalid type: Expected string but received 123"`,
    );
  });
  test("should return multiple errors without path", () => {
    expect(
      summarize([
        { message: 'Invalid content: Expected "foo" but received !"foo"' },
        { message: "Invalid length: Expected >=5 but received 3" },
      ]),
    ).toMatchInlineSnapshot(`
      "× Invalid content: Expected "foo" but received !"foo"
      × Invalid length: Expected >=5 but received 3"
    `);
  });
  test("should return single error with path", () => {
    expect(
      summarize([
        {
          message: 'Invalid type: Expected number but received "1"',
          path: [0],
        },
      ]),
    ).toMatchInlineSnapshot(`
      "× Invalid type: Expected number but received "1"
        → at 0"
    `);
  });
  test("should return multiple errors with path", () => {
    expect(
      summarize([
        {
          message: 'Invalid content: Expected "foo" but received !"foo"',
          path: ["key1"],
        },
        {
          message: "Invalid length: Expected >=5 but received 3",
          path: ["key1"],
        },
        {
          message: 'Invalid type: Expected number but received "21"',
          path: ["key2"],
        },
      ]),
    ).toMatchInlineSnapshot(`
      "× Invalid content: Expected "foo" but received !"foo"
        → at key1
      × Invalid length: Expected >=5 but received 3
        → at key1
      × Invalid type: Expected number but received "21"
        → at key2"
    `);
  });
  test("should return single error with dot path", () => {
    expect(
      summarize([
        {
          message: 'Invalid type: Expected number but received "foo"',
          path: ["dot", 0, "foo"],
        },
      ]),
    ).toMatchInlineSnapshot(`
      "× Invalid type: Expected number but received "foo"
        → at dot.0.foo"
    `);
  });
});
