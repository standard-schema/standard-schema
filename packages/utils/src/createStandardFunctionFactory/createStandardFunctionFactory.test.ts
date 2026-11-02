import type {
  StandardFunctionV1,
  StandardJSONSchemaV1,
  StandardSchemaV1,
} from "@standard-schema/spec";
import { describe, expect, expectTypeOf, test } from "vitest";
import { FunctionFailure } from "../FunctionFailure/index.ts";
import { createStandardFunctionFactory } from "./createStandardFunctionFactory.ts";

const createStandardFunction = createStandardFunctionFactory("my-lib");

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
      input: () => ({ type: "object", title: "city input" }),
      output: () => ({ type: "object", title: "city output" }),
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

describe("createStandardFunctionFactory", () => {
  test("should return props with vendor", () => {
    const fn = createStandardFunction({
      name: "get_weather",
      description: "Get the weather",
      input: citySchema,
      output: temperatureSchema,
      execute: () => 21,
    });
    expect(fn["~standard"]).toMatchObject({
      version: 1,
      vendor: "my-lib",
      name: "get_weather",
      description: "Get the weather",
    });
  });

  test("should default name and description to empty strings", () => {
    const fn = createStandardFunction({ execute: () => "Hello" });
    expect(fn["~standard"].name).toBe("");
    expect(fn["~standard"].description).toBe("");
  });

  test("should describe the input and output of the schemas", () => {
    const fn = createStandardFunction({
      input: citySchema,
      output: temperatureSchema,
      execute: ({ city }) => city.length,
    });
    const target = { target: "draft-2020-12" } as const;
    expect(fn["~standard"].jsonSchema.input(target)).toEqual({
      type: "object",
      title: "city input",
    });
    expect(fn["~standard"].jsonSchema.output(target)).toEqual({
      type: "string",
    });
  });

  test("should describe any value without schemas", () => {
    const fn = createStandardFunction({ execute: () => "Hello" });
    const target = { target: "draft-2020-12" } as const;
    expect(fn["~standard"].jsonSchema.input(target)).toEqual({});
    expect(fn["~standard"].jsonSchema.output(target)).toEqual({});
  });

  test("should infer types from schemas", () => {
    const fn = createStandardFunction({
      input: citySchema,
      output: temperatureSchema,
      execute: ({ city }) => city.length,
    });
    expectTypeOf<StandardFunctionV1.InferInput<typeof fn>>().toEqualTypeOf<{
      city: string;
    }>();
    expectTypeOf<
      StandardFunctionV1.InferOutput<typeof fn>
    >().toEqualTypeOf<string>();
    expectTypeOf<
      StandardFunctionV1.InferContext<typeof fn>
    >().toEqualTypeOf<unknown>();
    createStandardFunction({
      output: temperatureSchema,
      // @ts-expect-error
      execute: () => "21",
    });
  });

  test("should infer types without schemas", () => {
    const fn = createStandardFunction({ execute: () => "Hello" });
    expectTypeOf<
      StandardFunctionV1.InferInput<typeof fn>
    >().toEqualTypeOf<unknown>();
    expectTypeOf<
      StandardFunctionV1.InferOutput<typeof fn>
    >().toEqualTypeOf<string>();
  });

  test("should validate input and output", async () => {
    const fn = createStandardFunction({
      input: citySchema,
      output: temperatureSchema,
      execute: ({ city }) => city.length,
    });
    expect(
      await fn["~standard"].execute({ city: "Berlin" }, undefined),
    ).toEqual({
      value: "6 °C",
    });
  });

  test("should return issues if input is invalid", async () => {
    let called = false;
    const fn = createStandardFunction({
      input: citySchema,
      execute: () => {
        called = true;
      },
    });
    const result = await fn["~standard"].execute(
      // @ts-expect-error: callers may pass input that doesn't match its type
      { city: 1 },
      undefined,
    );
    expect(result).toEqual({
      source: "input",
      issues: [{ message: "Invalid city", path: ["city"] }],
    });
    expect(called).toBe(false);
  });

  test("should return issues if output is invalid", async () => {
    const fn = createStandardFunction({
      output: temperatureSchema,
      // @ts-expect-error
      execute: () => "21",
    });
    expect(await fn["~standard"].execute(undefined, undefined)).toEqual({
      source: "output",
      issues: [{ message: "Invalid temperature" }],
    });
  });

  test("should return issues if execution fails", async () => {
    let validated = false;
    const fn = createStandardFunction({
      output: {
        "~standard": {
          ...temperatureSchema["~standard"],
          validate: (value) => {
            validated = true;
            return temperatureSchema["~standard"].validate(value);
          },
        },
      },
      execute: (): number => {
        throw new FunctionFailure("Payment declined");
      },
    });
    expect(await fn["~standard"].execute(undefined, undefined)).toEqual({
      source: "execution",
      issues: [{ message: "Payment declined" }],
    });
    expect(validated).toBe(false);
  });

  test("should pass value through without schemas", async () => {
    const fn = createStandardFunction({ execute: (input) => input });
    expect(await fn["~standard"].execute(123, undefined)).toEqual({
      value: 123,
    });
  });

  test("should infer context and pass it with the options as-is", async () => {
    const fn = createStandardFunction({
      input: citySchema,
      execute: ({ city }, context: { prefix: string }) =>
        `${context.prefix} ${city}`,
    });
    expectTypeOf<StandardFunctionV1.InferContext<typeof fn>>().toEqualTypeOf<{
      prefix: string;
    }>();
    expectTypeOf(fn["~standard"].execute).parameter(1).toEqualTypeOf<{
      prefix: string;
    }>();
    expect(
      await fn["~standard"].execute({ city: "Berlin" }, { prefix: "Hello" }),
    ).toEqual({ value: "Hello Berlin" });

    const ctx = { prefix: "Hello" };
    const signal = new AbortController().signal;
    const echo = createStandardFunction({
      execute: (_, context: typeof ctx, options) => ({ context, options }),
    });
    const result = await echo["~standard"].execute(undefined, ctx, { signal });
    expect(result.issues).toBeUndefined();
    expect(result.issues ? undefined : result.value.context).toBe(ctx);
    expect(result.issues ? undefined : result.value.options.signal).toBe(
      signal,
    );
  });

  test("should pass empty options if none are given", async () => {
    const fn = createStandardFunction({
      execute: (_, _context, options) => options,
    });
    expect(await fn["~standard"].execute(undefined, undefined)).toEqual({
      value: {},
    });
  });

  test("should not catch other errors", async () => {
    const fn = createStandardFunction({
      execute: () => {
        throw new Error("Failed");
      },
    });
    await expect(fn["~standard"].execute(undefined, undefined)).rejects.toThrow(
      "Failed",
    );
  });
});
