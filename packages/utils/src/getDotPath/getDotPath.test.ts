import { describe, expect, test } from "vitest";
import { getDotPath } from "./getDotPath.ts";

describe("getDotPath", () => {
  test("should return null if path is undefined", () => {
    expect(
      getDotPath({
        message: "Error message",
      }),
    ).toBeNull();
    expect(
      getDotPath({
        message: "Error message",
        path: undefined,
      }),
    ).toBeNull();
  });

  test("should return null if path is empty", () => {
    expect(
      getDotPath({
        message: "Error message",
        path: [],
      }),
    ).toBeNull();
  });

  test("should return null if path contains item without key", () => {
    expect(
      getDotPath({
        message: "Error message",
        path: [
          {
            // @ts-expect-error
            key: null,
          },
        ],
      }),
    ).toBeNull();
  });

  test("should return null if path contains key that is not string or number", () => {
    expect(
      getDotPath({
        message: "Error message",
        path: [Symbol("foo"), "bar", "baz"],
      }),
    ).toBeNull();
    expect(
      getDotPath({
        message: "Error message",
        path: ["foo", Symbol("bar"), "baz"],
      }),
    ).toBeNull();
    expect(
      getDotPath({
        message: "Error message",
        path: [
          {
            // @ts-expect-error
            key: new Map([["foo", "bar"]]),
          },
          { key: "baz" },
        ],
      }),
    ).toBeNull();
    expect(
      getDotPath({
        message: "Error message",
        path: [
          { key: "foo" },
          {
            // @ts-expect-error
            key: new Map([["bar", "baz"]]),
          },
        ],
      }),
    ).toBeNull();
  });

  test("should return the dot path if it can be created", () => {
    expect(
      getDotPath({
        message: "Error message",
        path: ["nested", 0, "dot", 0, "path"],
      }),
    ).toBe("nested.0.dot.0.path");
    expect(
      getDotPath({
        message: "Error message",
        path: [
          { key: "nested" },
          { key: 0 },
          { key: "dot" },
          { key: 0 },
          { key: "path" },
        ],
      }),
    ).toBe("nested.0.dot.0.path");
  });
});
