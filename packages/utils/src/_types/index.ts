export type NotNullish = NonNullable<unknown>;
export type NonReducibleUnknown = NotNullish | null | undefined;
export type LooseAutocomplete<T, BaseType = NonReducibleUnknown> = T | BaseType;
export type KeyofUnion<T> = T extends unknown ? keyof T : never;
