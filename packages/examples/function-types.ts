/**
 * Type-level checks for the Standard Function spec. Each `Assert` must hold and
 * each `@ts-expect-error` must be an error, so `tsc` fails if the spec drifts.
 */

import type { StandardFunctionV1 } from "@standard-schema/spec";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B
  ? 1
  : 2
  ? true
  : false;
type Assert<T extends true> = T;

interface Db {
  query(sql: string): Promise<unknown[]>;
}
interface User {
  id: string;
}
type Empty = Record<string, never>;

declare const needsDb: StandardFunctionV1<
  { sql: string },
  unknown[],
  { db: Db }
>;
declare const needsUser: StandardFunctionV1<Empty, string, { user: User }>;
declare const needsNothing: StandardFunctionV1<Empty, string>;
declare const maybeDb: StandardFunctionV1<
  Empty,
  string,
  { db: Db } | undefined
>;
declare const needsSecret: StandardFunctionV1<
  Empty,
  string,
  { secret: string }
>;

// A framework that provides a context accepts every function needing at most that.
type AppContext = { db: Db; user: User };
declare function register(
  functions: ReadonlyArray<StandardFunctionV1<any, unknown, AppContext>>,
): void;
register([needsDb, needsUser, needsNothing, maybeDb]);
// @ts-expect-error needs a secret the framework doesn't provide
register([needsSecret]);

// A framework that may not have a user rejects functions that require one.
declare function registerAnonymous(
  functions: ReadonlyArray<StandardFunctionV1<any, unknown, { user?: User }>>,
): void;
// @ts-expect-error requires a user
registerAnonymous([needsUser]);

// `never` accepts every function, for code that describes functions without running them.
export const described: ReadonlyArray<StandardFunctionV1<any, unknown, never>> =
  [needsDb, needsUser, needsNothing, maybeDb, needsSecret];

// A plain `StandardFunctionV1` needs no context, so it accepts only functions that need none.
export const plain: StandardFunctionV1 = needsNothing;
// @ts-expect-error needs a db
export const plainDb: StandardFunctionV1 = needsDb;

// Options are always passed, with the caller's context.
needsNothing["~standard"].execute({}, { context: undefined });
needsDb["~standard"].execute({ sql: "" }, { context: { db: {} as Db } });
// @ts-expect-error options are required
needsNothing["~standard"].execute({});
// @ts-expect-error the context is required
needsDb["~standard"].execute({ sql: "" }, {});

// Generic framework code can pass its context blindly.
export function runAll<Context>(
  functions: ReadonlyArray<StandardFunctionV1<any, unknown, Context>>,
  context: Context,
): unknown[] {
  return functions.map((fn) => fn["~standard"].execute({}, { context }));
}

// The context needed to run a union of functions is the intersection of their contexts.
type _single = Assert<
  Equal<StandardFunctionV1.InferContext<typeof needsDb>, { db: Db }>
>;
type _union = Assert<
  Equal<
    StandardFunctionV1.InferContext<
      typeof needsDb | typeof needsUser | typeof needsNothing | typeof maybeDb
    >,
    { db: Db } & { user: User }
  >
>;
type _none = Assert<
  Equal<StandardFunctionV1.InferContext<typeof needsNothing>, unknown>
>;

// So a framework can infer the context it must provide from the functions it is given.
declare function defineAgent<
  const Functions extends ReadonlyArray<
    StandardFunctionV1<any, unknown, never>
  >,
>(config: {
  functions: Functions;
  context: StandardFunctionV1.InferContext<Functions[number]>;
}): void;
defineAgent({
  functions: [needsDb, needsUser],
  context: { db: {} as Db, user: { id: "1" } },
});
defineAgent({
  functions: [needsDb, needsUser],
  // @ts-expect-error missing the user
  context: { db: {} as Db },
});

// A failure always names its source; success has no issues.
type Result = StandardFunctionV1.Result<string>;
export const inputFailure: Result = {
  source: "input",
  issues: [{ message: "Unknown city", path: ["city"] }],
};
export const executionFailure: Result = {
  source: "execution",
  issues: [{ message: "Payment declined" }],
};
// @ts-expect-error a failure needs a source
export const noSource: Result = { issues: [{ message: "Failed" }] };
export function read(result: Result): string {
  if (result.issues) {
    return `${result.source}: ${result.issues.map((i) => i.message).join(", ")}`;
  }
  return result.value;
}

// `executeStream` yields results of the same output type.
export async function last(
  fn: StandardFunctionV1<Empty, string, undefined>,
): Promise<Result | undefined> {
  const stream = fn["~standard"].executeStream;
  if (!stream) return fn["~standard"].execute({}, { context: undefined });
  let result: Result | undefined;
  for await (const item of stream({}, { context: undefined })) result = item;
  return result;
}

// Input and output types are inferred from `types`.
type _input = Assert<
  Equal<StandardFunctionV1.InferInput<typeof needsDb>, { sql: string }>
>;
type _output = Assert<
  Equal<StandardFunctionV1.InferOutput<typeof needsDb>, unknown[]>
>;
