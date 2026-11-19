/**
 * Type tests for the Standard Tool interface. Each `Assert` must hold and each
 * `@ts-expect-error` must be an error, so `tsc` fails if the spec drifts from
 * what `tool.md` promises.
 */

import type {
  StandardJSONSchemaV1,
  StandardSchemaV1,
  StandardToolV1,
} from "@standard-schema/spec";

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

declare const db: Db;
declare const needsDb: StandardToolV1<{ sql: string }, unknown[], { db: Db }>;
declare const needsUser: StandardToolV1<Empty, string, { user: User }>;
declare const needsDbAndUser: StandardToolV1<
  Empty,
  string,
  { db: Db; user: User }
>;
declare const needsNothing: StandardToolV1<Empty, string>;
declare const maybeDb: StandardToolV1<Empty, string, { db: Db } | undefined>;
declare const undefinedContext: StandardToolV1<Empty, string, undefined>;

// A framework accepts every tool needing at most the context it provides.
declare function register(
  tools: ReadonlyArray<StandardToolV1<any, unknown, { db: Db; user: User }>>,
): void;
register([needsDb, needsUser, needsDbAndUser, needsNothing, maybeDb]);
declare function registerDb(
  tools: ReadonlyArray<StandardToolV1<any, unknown, { db: Db }>>,
): void;
// @ts-expect-error needs a user the framework doesn't provide
registerDb([needsDbAndUser]);
// @ts-expect-error a context of `undefined` means it accepts only `undefined`
registerDb([undefinedContext]);

// A framework that never passes a context accepts tools whose context can be undefined.
declare function registerWithoutContext(
  tools: ReadonlyArray<StandardToolV1<any, unknown, undefined>>,
): void;
registerWithoutContext([needsNothing, maybeDb, undefinedContext]);
// @ts-expect-error requires a db
registerWithoutContext([needsDb]);

// A framework that takes its context beside the tools infers `Context` from
// the context alone. Inferred from the tools too, a tool that needs no context
// would make it `unknown`.
declare function run<Context>(
  tools: ReadonlyArray<StandardToolV1<any, unknown, NoInfer<Context>>>,
  context: Context,
): void;
run([needsNothing, needsDb], { db });
// @ts-expect-error needs a user the framework doesn't provide
run([needsNothing, needsUser], { db });
declare function runWrongly<Context>(
  tools: ReadonlyArray<StandardToolV1<any, unknown, Context>>,
  context: Context,
): void;
// @ts-expect-error `Context` is inferred as `unknown`, so the tool needing a db is rejected
runWrongly([needsNothing, needsDb], { db });

// `ExecuteFunction` is the type of `execute`.
type _execute = Assert<
  Equal<
    StandardToolV1.ExecuteFunction<Empty, Text, { db: Db }>,
    StandardToolV1.Props<Empty, Text, { db: Db }>["execute"]
  >
>;

// A plain `StandardToolV1` can be run with any context, so it accepts only
// tools whose `Context` is `unknown`.
export const plain: StandardToolV1 = needsNothing;
// @ts-expect-error requires a db
export const plainDb: StandardToolV1 = needsDb;
// @ts-expect-error a db may be passed, so any other context isn't safe
export const plainMaybeDb: StandardToolV1 = maybeDb;
// @ts-expect-error accepts only `undefined`
export const plainUndefined: StandardToolV1 = undefinedContext;

// `never` accepts every tool, as `defineAgent` below relies on, without
// letting anyone run it.
declare const described: StandardToolV1<any, unknown, never>;
// @ts-expect-error no context is `never`
described["~standard"].execute({}, { context: {} });

// Options are required with a context exactly when the tool requires one.
needsNothing["~standard"].execute({});
maybeDb["~standard"].execute({});
needsDb["~standard"].execute({ sql: "" }, { context: { db } });
// @ts-expect-error the context is required
needsDb["~standard"].execute({ sql: "" });
// @ts-expect-error the context is required
needsDb["~standard"].execute({ sql: "" }, {});
// @ts-expect-error the context can't be undefined
needsDb["~standard"].execute({ sql: "" }, { context: undefined });
// @ts-expect-error the context needs a db
needsDb["~standard"].execute({ sql: "" }, { context: {} });

// Options built ahead of time can hold a context that may be undefined.
declare const maybeContext: { db: Db } | undefined;
export const prepared: StandardToolV1.Options<{ db: Db }> = {
  context: maybeContext,
};

type _signal = Assert<
  Equal<StandardToolV1.Options["signal"], AbortSignal | undefined>
>;
// `name` and `description` are always strings, and the defaults accept every
// tool that needs no context.
type _name = Assert<Equal<StandardToolV1.Props["name"], string>>;
type _description = Assert<Equal<StandardToolV1.Props["description"], string>>;
type _defaults = Assert<
  Equal<StandardToolV1, StandardToolV1<any, unknown, unknown>>
>;
type _meta = Assert<
  Equal<StandardToolV1.Props["meta"], Record<string, unknown> | undefined>
>;

// The context needed to run a union of tools is the intersection of theirs.
type _union = Assert<
  Equal<
    StandardToolV1.InferContext<typeof needsDb | typeof needsUser>,
    { db: Db } & { user: User }
  >
>;
type _optional = Assert<
  Equal<StandardToolV1.InferContext<typeof maybeDb>, { db: Db } | undefined>
>;

// So an agent can require exactly the context its tools need.
type AgentConfig<
  Tools extends ReadonlyArray<StandardToolV1<any, unknown, never>>,
> = {
  tools: Tools;
  context: StandardToolV1.InferContext<Tools[number]>;
};
declare function defineAgent<
  const Tools extends ReadonlyArray<StandardToolV1<any, unknown, never>>,
>(config: AgentConfig<Tools>): void;
defineAgent({
  tools: [needsDb, needsUser, needsNothing],
  context: { db, user: { id: "1" } },
});
defineAgent({
  tools: [needsDb, needsUser],
  // @ts-expect-error missing the user
  context: { db },
});

// Inferring `Context` from an array of tools picks one tool's context rather
// than combining them.
declare function defineAgentWrongly<Context>(
  tools: ReadonlyArray<StandardToolV1<any, unknown, Context>>,
): void;
// @ts-expect-error `Context` is inferred from one tool, so the other is rejected
defineAgentWrongly([needsDb, needsUser]);

// Code generic over `Context` forwards options with a rest parameter, so they
// stay required or optional with the tool's.
export function wrap<Input, Output, Context>(
  tool: StandardToolV1<Input, Output, Context>,
): StandardToolV1<Input, Output, Context> {
  return {
    "~standard": {
      ...tool["~standard"],
      execute: (input, ...options) =>
        tool["~standard"].execute(input, ...options),
    },
  };
}

// Or it takes them as optional, since it can't know yet whether they're required.
export function withCallId<Context>(
  tool: StandardToolV1<Empty, string, Context>,
): StandardToolV1<Empty, string, Context> {
  return {
    "~standard": {
      ...tool["~standard"],
      execute: async (_input, options?) => ({ value: options?.callId ?? "" }),
    },
  };
}

// `Input` is a parameter of `execute`, so frameworks accept tools with `any`
// input, the default.
declare const idInput: StandardToolV1<{ id: string }, string>;
// @ts-expect-error `execute` would get input it doesn't accept
export const unknownInput: StandardToolV1<unknown, string> = idInput;
export const anyInput: StandardToolV1 = idInput;

// `Input` and `Output` are what `execute` takes and resolves to, even if the
// schemas transform: here the model sends a string and `execute` gets a number.
// A hand-written tool uses `satisfies`, so it keeps its schema's type.
type ToolSchema<Input, Output> = StandardSchemaV1<Input, Output> &
  StandardJSONSchemaV1<Input, Output>;
declare const parsesNumber: ToolSchema<string, number>;
const double = {
  "~standard": {
    version: 1,
    vendor: "example",
    name: "double",
    description: "",
    input: parsesNumber,
    output: parsesNumber,
    execute: async (n: number) => ({ value: String(n * 2) }),
  },
} satisfies StandardToolV1<number, string>;
type _input = Assert<Equal<StandardToolV1.InferInput<typeof double>, number>>;
type _output = Assert<Equal<StandardToolV1.InferOutput<typeof double>, string>>;

// A framework that validates accepts only tools whose `input` can validate.
export const validated: StandardToolV1.Validatable<number, string> = double;
// @ts-expect-error annotating a tool as `StandardToolV1` widens its `input` to Standard JSON Schema
export const annotated: StandardToolV1.Validatable<number, string> =
  double as StandardToolV1<number, string>;
declare function registerValidatable(
  tools: ReadonlyArray<StandardToolV1.Validatable<any, unknown, { db: Db }>>,
): void;
registerValidatable([validated]);
declare const validatableNeedsUser: StandardToolV1.Validatable<
  Empty,
  string,
  { user: User }
>;
// @ts-expect-error needs a user the framework doesn't provide
registerValidatable([validatableNeedsUser]);

// `validate` on a `Validatable` tool's `input` produces the `Input` that
// `execute` takes.
type _validates = Assert<
  Equal<
    Awaited<
      ReturnType<
        StandardToolV1.Validatable<
          number,
          string
        >["~standard"]["input"]["~standard"]["validate"]
      >
    >,
    StandardSchemaV1.Result<number>
  >
>;
