import { describe, expect, test } from "vitest";
import { getPathSegmentKey } from "./getPathSegmentKey.ts";

describe("getPathSegmentKey", () => {
  const symbol = Symbol("foo");
  test("should return key as is if it is not an object", () => {
    expect(getPathSegmentKey("foo")).toBe("foo");
    expect(getPathSegmentKey(0)).toBe(0);
    expect(getPathSegmentKey(symbol)).toBe(symbol);
  });
  test("should return the key of an object path segment", () => {
    expect(getPathSegmentKey({ key: "foo" })).toBe("foo");
    expect(getPathSegmentKey({ key: 0 })).toBe(0);
    expect(getPathSegmentKey({ key: symbol })).toBe(symbol);
  });
});
