import type { StandardSchemaV1 } from "@standard-schema/spec";

export type InferInputWithDefault<Schema, Default> =
  Schema extends StandardSchemaV1
    ? StandardSchemaV1.InferInput<Schema>
    : Default;

export type InferOutputWithDefault<Schema, Default> =
  Schema extends StandardSchemaV1
    ? StandardSchemaV1.InferOutput<Schema>
    : Default;
