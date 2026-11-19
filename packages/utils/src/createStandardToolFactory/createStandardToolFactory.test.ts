import type {
  StandardJSONSchemaV1,
  StandardSchemaV1,
  StandardToolV1,
} from "@standard-schema/spec";
import { describe, expect, expectTypeOf, test } from "vitest";
import { createStandardToolFactory } from "./createStandardToolFactory.ts";

const createStandardTool = createStandardToolFactory("my-ai-lib");

const citySchema: StandardSchemaV1<{ city: string }, { city: string }> &
  StandardJSONSchemaV1<{ city: string }, { city: string }> = {
  "~standard": {
    version: 1,
    vendor: "test",
    validate: (value) =>
      typeof value === "object" &&
      value !== null &&
      "city" in value &&
      typeof value.city === "string"
        ? { value: { city: value.city } }
        : { issues: [{ message: "Invalid city", path: ["city"] }] },
    jsonSchema: {
      input: () => ({ type: "object" }),
      output: () => ({ type: "object" }),
    },
  },
};

const temperatureSchema: StandardSchemaV1<number, string> &
  StandardJSONSchemaV1<number, string> = {
  "~standard": {
    version: 1,
    vendor: "test",
    validate: (value) =>
      typeof value === "number"
        ? { value: `${value} °C` }
        : { issues: [{ message: "Invalid temperature" }] },
    jsonSchema: {
      input: () => ({ type: "number" }),
      output: () => ({ type: "string" }),
    },
  },
};

describe("createStandardToolFactory", () => {
  test("should return props with vendor", () => {
    const tool = createStandardTool({
      name: "get_weather",
      description: "Get the weather",
      input: citySchema,
      output: temperatureSchema,
      execute: () => 21,
    });
    expect(tool["~standard"]).toMatchObject({
      version: 1,
      vendor: "my-ai-lib",
      name: "get_weather",
      description: "Get the weather",
      input: citySchema,
      output: temperatureSchema,
    });
  });

  test("should infer types from schemas", () => {
    const tool = createStandardTool({
      input: citySchema,
      output: temperatureSchema,
      execute: ({ city }) => city.length,
    });
    expectTypeOf<StandardToolV1.InferInput<typeof tool>>().toEqualTypeOf<{
      city: string;
    }>();
    expectTypeOf<
      StandardToolV1.InferOutput<typeof tool>
    >().toEqualTypeOf<string>();
    createStandardTool({
      output: temperatureSchema,
      // @ts-expect-error
      execute: () => "21",
    });
  });

  test("should infer types without schemas", () => {
    const tool = createStandardTool({ execute: () => "Hello" });
    expectTypeOf<
      StandardToolV1.InferInput<typeof tool>
    >().toEqualTypeOf<unknown>();
    expectTypeOf<
      StandardToolV1.InferOutput<typeof tool>
    >().toEqualTypeOf<string>();
  });

  test("should validate input and output", async () => {
    const tool = createStandardTool({
      input: citySchema,
      output: temperatureSchema,
      execute: ({ city }) => city.length,
    });
    expect(await tool["~standard"].execute({ city: "Berlin" })).toEqual({
      value: "6 °C",
    });
  });

  test("should return issues if input is invalid", async () => {
    let called = false;
    const tool = createStandardTool({
      input: citySchema,
      execute: () => {
        called = true;
      },
    });
    expect(await tool["~standard"].execute({ city: 1 })).toEqual({
      source: "input",
      issues: [{ message: "Invalid city", path: ["city"] }],
    });
    expect(called).toBe(false);
  });

  test("should return issues if output is invalid", async () => {
    const tool = createStandardTool({
      output: temperatureSchema,
      // @ts-expect-error
      execute: () => "21",
    });
    expect(await tool["~standard"].execute(undefined)).toEqual({
      source: "output",
      issues: [{ message: "Invalid temperature" }],
    });
  });

  test("should pass value through without schemas", async () => {
    const tool = createStandardTool({ execute: (input) => input });
    expect(await tool["~standard"].execute(123)).toEqual({ value: 123 });
  });

  test("should pass options and infer context", async () => {
    const tool = createStandardTool({
      input: citySchema,
      execute: (
        { city },
        options: StandardToolV1.Options<{ prefix: string }>,
      ) => `${options.context?.prefix} ${city} ${options.callId}`,
    });
    expectTypeOf<StandardToolV1.InferContext<typeof tool>>().toEqualTypeOf<{
      prefix: string;
    }>();
    expect(
      await tool["~standard"].execute(
        { city: "Berlin" },
        { callId: "1", context: { prefix: "Hello" } },
      ),
    ).toEqual({ value: "Hello Berlin 1" });
  });

  test("should pass empty options if none are given", async () => {
    const tool = createStandardTool({ execute: (_, options) => options });
    expect(await tool["~standard"].execute(undefined)).toEqual({ value: {} });
  });

  test("should not catch errors", async () => {
    const tool = createStandardTool({
      execute: () => {
        throw new Error("Failed");
      },
    });
    await expect(tool["~standard"].execute(undefined)).rejects.toThrow(
      "Failed",
    );
  });
});
