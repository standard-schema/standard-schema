export type NotNullish = NonNullable<unknown>;
export type Nullish<T> = T | null | undefined;
export type NonReducibleUnknown = Nullish<NotNullish>;
export type LooseAutocomplete<T, TBaseType = NonReducibleUnknown> =
  | T
  | TBaseType;
export type KeyofUnion<T> = T extends unknown ? keyof T : never;
