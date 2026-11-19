import { describe, expect, test } from "vitest";
import { getJsonPointer } from "./getJsonPointer.ts";

describe("getJsonPointer", () => {
  test("should return the whole value pointer if path is undefined", () => {
    expect(
      getJsonPointer({
        message: "Error message",
      }),
    ).toBe("");
    expect(
      getJsonPointer({
        message: "Error message",
        path: undefined,
      }),
    ).toBe("");
  });

  test("should return the whole value pointer if path is empty", () => {
    expect(
      getJsonPointer({
        message: "Error message",
        path: [],
      }),
    ).toBe("");
  });

  test("should return null if path contains item without key", () => {
    expect(
      getJsonPointer({
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
      getJsonPointer({
        message: "Error message",
        path: [Symbol("foo"), "bar", "baz"],
      }),
    ).toBeNull();
    expect(
      getJsonPointer({
        message: "Error message",
        path: ["foo", Symbol("bar"), "baz"],
      }),
    ).toBeNull();
    expect(
      getJsonPointer({
        message: "Error message",
        path: [{ key: Symbol("foo") }, { key: "bar" }],
      }),
    ).toBeNull();
    expect(
      getJsonPointer({
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

  test("should return the JSON Pointer if it can be created", () => {
    expect(
      getJsonPointer({
        message: "Error message",
        path: ["nested", 0, "json", 0, "pointer"],
      }),
    ).toBe("/nested/0/json/0/pointer");
    expect(
      getJsonPointer({
        message: "Error message",
        path: [
          { key: "nested" },
          { key: 0 },
          { key: "json" },
          { key: 0 },
          { key: "pointer" },
        ],
      }),
    ).toBe("/nested/0/json/0/pointer");
    expect(
      getJsonPointer({
        message: "Error message",
        path: ["nested", { key: 0 }, "pointer"],
      }),
    ).toBe("/nested/0/pointer");
  });

  test("should keep keys containing a dot apart from nested keys", () => {
    expect(
      getJsonPointer({
        message: "Error message",
        path: ["note.title"],
      }),
    ).toBe("/note.title");
    expect(
      getJsonPointer({
        message: "Error message",
        path: ["note", "title"],
      }),
    ).toBe("/note/title");
  });

  test("should escape ~ and / in keys", () => {
    expect(
      getJsonPointer({
        message: "Error message",
        path: ["note/title"],
      }),
    ).toBe("/note~1title");
    expect(
      getJsonPointer({
        message: "Error message",
        path: ["~note"],
      }),
    ).toBe("/~0note");
    expect(
      getJsonPointer({
        message: "Error message",
        path: ["~1"],
      }),
    ).toBe("/~01");
    expect(
      getJsonPointer({
        message: "Error message",
        path: [{ key: "a/~b" }],
      }),
    ).toBe("/a~1~0b");
  });

  test("should keep empty string keys", () => {
    expect(
      getJsonPointer({
        message: "Error message",
        path: [""],
      }),
    ).toBe("/");
    expect(
      getJsonPointer({
        message: "Error message",
        path: ["notes", "", 0],
      }),
    ).toBe("/notes//0");
  });
});
