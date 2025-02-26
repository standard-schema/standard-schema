import type { StandardSchemaV1 } from "@standard-schema/spec";

export const stringSchema: StandardSchemaV1<string> = {
  "~standard": {
    version: 1,
    vendor: "custom",
    validate: (value) => {
      const pass = typeof value === "string";
      return pass
        ? { value }
        : {
            issues: [
              { message: `Expected string, got ${typeof value}`, path: [] },
            ],
          };
    },
  },
};

export const asyncStringSchema: StandardSchemaV1<string> = {
  "~standard": {
    version: 1,
    vendor: "custom",
    validate: async (value) => {
      const pass = typeof value === "string";
      return pass
        ? { value }
        : {
            issues: [
              { message: `Expected string, got ${typeof value}`, path: [] },
            ],
          };
    },
  },
};

export interface Fields {
  foo: string;
  bar: number;
}

export const fieldsSchema: StandardSchemaV1<Fields> = {
  "~standard": {
    version: 1,
    vendor: "custom",
    validate: () => ({ issues: [{ message: "Not implemented" }] }),
  },
};
