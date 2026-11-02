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
interface Writer {
  write(chunk: string): void;
}
type Empty = Record<string, never>;
type Options = StandardFunctionV1.Options;

declare const needsDb: StandardFunctionV1<
  { sql: string },
  unknown[],
  Options & { context: { db: Db } }
>;
declare const needsUser: StandardFunctionV1<
  Empty,
  string,
  Options & { context: { user: User } }
>;
declare const needsNothing: StandardFunctionV1<Empty, string>;
declare const maybeDb: StandardFunctionV1<
  Empty,
  string,
  Options & { context?: { db: Db } | undefined }
>;
declare const needsSecret: StandardFunctionV1<
  Empty,
  string,
  Options & { context: { secret: string } }
>;
// A function that also needs an option a framework provides, next to the standard ones.
declare const needsWriter: StandardFunctionV1<
  Empty,
  string,
  Options & { context: { db: Db }; writer: Writer }
>;

// A framework accepts every function needing at most the options it provides.
type AppOptions = Options & { context: { db: Db; user: User }; writer: Writer };
declare function register(
  functions: ReadonlyArray<StandardFunctionV1<any, unknown, AppOptions>>,
): void;
register([needsDb, needsUser, needsNothing, maybeDb, needsWriter]);
// @ts-expect-error needs a secret the framework doesn't provide
register([needsSecret]);

// A framework without a writer rejects functions that need one.
declare function registerWithoutWriter(
  functions: ReadonlyArray<
    StandardFunctionV1<any, unknown, Options & { context: { db: Db } }>
  >,
): void;
registerWithoutWriter([needsDb, needsNothing]);
// @ts-expect-error needs a writer
registerWithoutWriter([needsWriter]);

// A framework that may not have a user rejects functions that require one.
declare function registerAnonymous(
  functions: ReadonlyArray<
    StandardFunctionV1<any, unknown, Options & { context: { user?: User } }>
  >,
): void;
// @ts-expect-error requires a user
registerAnonymous([needsUser]);

// `never` accepts every function, for code that describes functions without running them.
export const described: ReadonlyArray<StandardFunctionV1<any, unknown, never>> =
  [needsDb, needsUser, needsNothing, maybeDb, needsSecret, needsWriter];

// A plain `StandardFunctionV1` needs only the standard options, so it accepts only functions that need nothing else.
export const plain: StandardFunctionV1 = needsNothing;
// @ts-expect-error needs a db
export const plainDb: StandardFunctionV1 = needsDb;

// Options are always passed, with a context when the function needs one.
needsNothing["~standard"].execute({}, {});
needsNothing["~standard"].execute(
  {},
  { signal: new AbortController().signal, callId: "call_1" },
);
needsDb["~standard"].execute({ sql: "" }, { context: { db: {} as Db } });
// @ts-expect-error options are required
needsNothing["~standard"].execute({});
// @ts-expect-error the context is required
needsDb["~standard"].execute({ sql: "" }, {});
// @ts-expect-error the context needs a db
needsDb["~standard"].execute({ sql: "" }, { context: {} });
// @ts-expect-error the standard options have standard types
needsNothing["~standard"].execute({}, { callId: 1 });

// Generic framework code can pass its options blindly.
export function runAll<Opts extends Options>(
  functions: ReadonlyArray<StandardFunctionV1<any, unknown, Opts>>,
  options: Opts,
): unknown[] {
  return functions.map((fn) => fn["~standard"].execute({}, options));
}

// The options needed to run a union of functions are the intersection of theirs.
type _single = Assert<
  Equal<
    StandardFunctionV1.InferOptions<typeof needsDb>,
    Options & { context: { db: Db } }
  >
>;
type _unionContext = Assert<
  Equal<
    StandardFunctionV1.InferOptions<
      typeof needsDb | typeof needsUser | typeof needsNothing
    >["context"],
    { db: Db } & { user: User }
  >
>;
type _unionWriter = Assert<
  Equal<
    StandardFunctionV1.InferOptions<
      typeof needsUser | typeof needsWriter
    > extends { writer: Writer }
      ? true
      : false,
    true
  >
>;
type _none = Assert<
  Equal<StandardFunctionV1.InferOptions<typeof needsNothing>, Options>
>;

// So a framework can infer the context it must be given from the functions it is given.
declare function defineAgent<
  const Functions extends ReadonlyArray<
    StandardFunctionV1<any, unknown, never>
  >,
>(config: {
  functions: Functions;
  context: StandardFunctionV1.InferOptions<Functions[number]>["context"];
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

// Inferring the options from an array of functions infers them from the first one only.
declare function defineAgentWrongly<Opts extends Options>(
  functions: ReadonlyArray<StandardFunctionV1<any, unknown, Opts>>,
): void;
// @ts-expect-error `Opts` is inferred from `needsDb`, so `needsUser` is rejected
defineAgentWrongly([needsDb, needsUser]);

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
  fn: StandardFunctionV1<Empty, string>,
): Promise<Result | undefined> {
  const stream = fn["~standard"].executeStream;
  if (!stream) return fn["~standard"].execute({}, {});
  let result: Result | undefined;
  for await (const item of stream({}, {})) result = item;
  return result;
}

// Input and output types are inferred from `types`.
type _input = Assert<
  Equal<StandardFunctionV1.InferInput<typeof needsDb>, { sql: string }>
>;
type _output = Assert<
  Equal<StandardFunctionV1.InferOutput<typeof needsDb>, unknown[]>
>;
