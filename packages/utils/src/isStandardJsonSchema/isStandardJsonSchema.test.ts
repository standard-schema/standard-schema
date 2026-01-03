import { describe, expect, test } from "vitest";
import { stringJsonSchema } from "../__test_fixtures/index.ts";
import { isStandardJsonSchema } from "./isStandardJsonSchema.ts";

describe("isStandardJsonSchema", () => {
	test("should return true for standard json schema", () => {
		expect(isStandardJsonSchema(stringJsonSchema)).toBe(true);
	});
	test("should return false for non-standard json schema", () => {
		expect(isStandardJsonSchema({ parse() {} })).toBe(false);
		expect(isStandardJsonSchema(null)).toBe(false);
		expect(isStandardJsonSchema({ "~standard": null })).toBe(false);
	});
	test("should return false for ~standard without jsonSchema", () => {
		expect(
			isStandardJsonSchema({
				"~standard": {
					version: 1,
					vendor: "custom",
					validate() {
						return {};
					},
				},
			}),
		).toBe(false);
	});
	test("should return false for ~standard with invalid jsonSchema", () => {
		expect(
			isStandardJsonSchema({
				"~standard": {
					version: 1,
					vendor: "custom",
					jsonSchema: {
						input() {
							return {};
						},
					},
				},
			}),
		).toBe(false);
	});
	test("should return false for ~standard with invalid jsonSchema.output", () => {
		expect(
			isStandardJsonSchema({
				"~standard": {
					version: 1,
					vendor: "custom",
					jsonSchema: {
						input() {
							return {};
						},
						output: "invalid",
					},
				},
			}),
		).toBe(false);
	});
});
