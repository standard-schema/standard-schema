import {
  type CreateStandardTool,
  createStandardToolFactory,
} from "../createStandardToolFactory/index.ts";

/**
 * Creates a Standard Tool with the vendor name `"standard-schema"`. Use it if
 * your AI library doesn't export its own `createStandardTool`.
 */
export const createStandardTool: CreateStandardTool =
  createStandardToolFactory("standard-schema");
