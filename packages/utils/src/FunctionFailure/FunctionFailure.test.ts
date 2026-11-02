import { describe, expect, test } from "vitest";
import { FunctionFailure } from "./FunctionFailure.ts";

describe("FunctionFailure", () => {
  test("should create error instance", () => {
    const failure = new FunctionFailure("Payment declined");
    expect(failure).toBeInstanceOf(Error);
    expect(failure).toBeInstanceOf(FunctionFailure);
    expect(failure.name).toBe("FunctionFailure");
    expect(failure.message).toBe("Payment declined");
  });
});
