/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    fileParallelism: false,
    isolate: false,
    coverage: {
      include: ["src"],
      exclude: ["**/index.ts", "**/*.test.ts"],
    },
    typecheck: {
      enabled: true,
    },
  },
});
