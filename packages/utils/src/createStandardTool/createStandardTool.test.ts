import { describe, expect, test } from "vitest";
import { createStandardTool } from "./createStandardTool.ts";

describe("createStandardTool", () => {
  test("should use standard-schema as vendor", async () => {
    const tool = createStandardTool({ execute: () => "Hello" });
    expect(tool["~standard"].vendor).toBe("standard-schema");
    expect(await tool["~standard"].execute(undefined)).toEqual({
      value: "Hello",
    });
  });
});
