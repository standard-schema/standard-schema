import { describe, expect, test } from "vitest";
import { createStandardFunction } from "./createStandardFunction.ts";

describe("createStandardFunction", () => {
  test("should use standard-schema as vendor", async () => {
    const fn = createStandardFunction({ execute: () => "Hello" });
    expect(fn["~standard"].vendor).toBe("standard-schema");
    expect(
      await fn["~standard"].execute(undefined, { context: undefined }),
    ).toEqual({ value: "Hello" });
  });
});
