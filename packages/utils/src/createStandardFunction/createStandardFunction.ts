import {
  type CreateStandardFunction,
  createStandardFunctionFactory,
} from "../createStandardFunctionFactory/index.ts";

/**
 * Creates a Standard Function with the vendor name `"standard-schema"`. Use it
 * if your library doesn't export its own `createStandardFunction`.
 */
export const createStandardFunction: CreateStandardFunction =
  createStandardFunctionFactory("standard-schema");
