import type { StandardSchemaV1 } from "@standard-schema/spec";

export type InferInputWithDefault<TSchema, TDefault> =
  TSchema extends StandardSchemaV1
    ? StandardSchemaV1.InferInput<TSchema>
    : TDefault;

export type InferOutputWithDefault<TSchema, TDefault> =
  TSchema extends StandardSchemaV1
    ? StandardSchemaV1.InferOutput<TSchema>
    : TDefault;
