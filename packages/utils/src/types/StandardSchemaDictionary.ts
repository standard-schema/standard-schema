import type { StandardSchemaV1 } from "@standard-schema/spec";

export type StandardSchemaV1Dictionary<
  Input = Record<string, unknown>,
  Output extends Record<keyof Input, unknown> = Input,
> = {
  [K in keyof Input]: StandardSchemaV1<Input[K], Output[K]>;
};

export namespace StandardSchemaV1Dictionary {
  export type InferInput<Schema extends StandardSchemaV1Dictionary> = {
    [K in keyof Schema]: StandardSchemaV1.InferInput<Schema[K]>;
  };
  export type InferOutput<Schema extends StandardSchemaV1Dictionary> = {
    [K in keyof Schema]: StandardSchemaV1.InferOutput<Schema[K]>;
  };
}

export type StandardSchemaV1Tuple<
  Input extends unknown[] = unknown[],
  Output extends { [K in keyof Input]: unknown } = Input,
> = {
  [K in keyof Input]: StandardSchemaV1<Input[K], Output[K]>;
};
export namespace StandardSchemaV1Tuple {
  export type InferInput<Schema extends StandardSchemaV1Tuple> = {
    [K in keyof Schema]: StandardSchemaV1.InferInput<Schema[K]>;
  };
  export type InferOutput<Schema extends StandardSchemaV1Tuple> = {
    [K in keyof Schema]: StandardSchemaV1.InferOutput<Schema[K]>;
  };
}
