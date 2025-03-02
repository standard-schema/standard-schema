export type NotNullish = NonNullable<unknown>;
export type NonReducibleUnknown = NotNullish | null | undefined;
export type LooseAutocomplete<T> = T | NonReducibleUnknown;
export type KeyofUnion<T> = T extends unknown ? keyof T : never;
