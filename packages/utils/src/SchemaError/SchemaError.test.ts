import { describe, expect, test } from "vitest";
import { SchemaError } from "./SchemaError.ts";

describe("SchemaError", () => {
  test("should create error instance", () => {
    const issues = [
      { message: "Error message 1" },
      { message: "Error message 2" },
    ];
    const error = new SchemaError(issues);
    expect(error).toBeInstanceOf(SchemaError);
    expect(error.name).toBe("SchemaError");
    expect(error.message).toMatchInlineSnapshot(`
      "× Error message 1
      × Error message 2"
    `);
    expect(error.issues).toStrictEqual(issues);
  });
});
