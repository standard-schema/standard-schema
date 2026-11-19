/**
 * Type-level checks for Standard Functions written for different frameworks.
 * Two hypothetical frameworks give their functions different options of their
 * own and different contexts. A host that types the options it provides can
 * run functions from both, and rejects any function that needs an option it
 * doesn't provide. Each `Assert` must hold and each `@ts-expect-error` must be
 * an error, so `tsc` fails if the spec drifts.
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
interface Message {
  role: "user" | "assistant";
  content: string;
}
interface Writer {
  write(chunk: string): void;
}

declare const db: Db;
declare const signal: AbortSignal;
declare const writer: Writer;

// Framework A, an agent library: every call has an id and sees the conversation.
type AgentContext = { db: Db; userId: string };
type AgentOptions = {
  signal?: AbortSignal | undefined;
  callId: string;
  context: AgentContext;
  messages: ReadonlyArray<Message>;
};

// Framework B, a workflow engine: every run can be cancelled and streams progress.
type WorkflowContext = { db: Db; tenantId: string };
type WorkflowOptions = {
  signal: AbortSignal;
  callId?: string | undefined;
  context: WorkflowContext;
  writer: Writer;
};

// A function written for A that uses what only A provides.
declare const summarize: StandardFunctionV1<
  { length: number },
  string,
  AgentOptions
>;
// A function written for B that uses what only B provides.
declare const exportReport: StandardFunctionV1<
  { format: "csv" | "pdf" },
  string,
  WorkflowOptions
>;
// A function written for A that only uses the database. Typed with what it
// uses rather than with everything A provides, it isn't tied to A.
declare const lookup: StandardFunctionV1<
  { id: string },
  unknown,
  { context: { db: Db } }
>;
// The same function, typed with everything A provides, is tied to A.
declare const lookupForAgents: StandardFunctionV1<
  { id: string },
  unknown,
  AgentOptions
>;
// A function that needs nothing beyond the standard options.
declare const now: StandardFunctionV1<Record<string, never>, string>;

// Each framework runs its own functions and the ones that only need what it provides.
declare function runInAgent(
  functions: ReadonlyArray<StandardFunctionV1<any, unknown, AgentOptions>>,
): void;
declare function runInWorkflow(
  functions: ReadonlyArray<StandardFunctionV1<any, unknown, WorkflowOptions>>,
): void;
runInAgent([summarize, lookup, lookupForAgents, now]);
runInWorkflow([exportReport, lookup, now]);
// @ts-expect-error B has no messages, and its call id may be missing
runInWorkflow([summarize]);
// @ts-expect-error A has no writer, and its signal may be missing
runInAgent([exportReport]);
// @ts-expect-error typed with everything A provides, so B can't run it
runInWorkflow([lookupForAgents]);

// A host that provides everything both frameworks do runs functions from both.
type HostOptions = {
  signal: AbortSignal;
  callId: string;
  context: AgentContext & WorkflowContext;
  messages: ReadonlyArray<Message>;
  writer: Writer;
};
declare function runInHost(
  functions: ReadonlyArray<StandardFunctionV1<any, unknown, HostOptions>>,
): void;
runInHost([summarize, exportReport, lookup, lookupForAgents, now]);

// A host can also infer what it must provide from the functions it's given.
declare function host<
  const Functions extends ReadonlyArray<
    StandardFunctionV1<any, unknown, never>
  >,
>(
  functions: Functions,
  options: StandardFunctionV1.InferOptions<Functions[number]>,
): void;
host([summarize, exportReport], {
  signal,
  callId: "call_1",
  context: { db, userId: "user_1", tenantId: "tenant_1" },
  messages: [],
  writer,
});
host(
  [summarize, exportReport],
  // @ts-expect-error exportReport needs a writer
  {
    signal,
    callId: "call_1",
    context: { db, userId: "user_1", tenantId: "tenant_1" },
    messages: [],
  },
);
host(
  [summarize, exportReport],
  // @ts-expect-error exportReport needs a signal, even though summarize doesn't
  {
    callId: "call_1",
    context: { db, userId: "user_1", tenantId: "tenant_1" },
    messages: [],
    writer,
  },
);
host([lookup, now], { context: { db } });

// What a host must provide is the intersection of what its functions need:
// required where any function requires it, with every context key.
type Needed = StandardFunctionV1.InferOptions<
  typeof summarize | typeof exportReport
>;
type _signal = Assert<Equal<Needed["signal"], AbortSignal>>;
type _callId = Assert<Equal<Needed["callId"], string>>;
type _context = Assert<
  Equal<
    Needed["context"],
    { db: Db; userId: string } & { db: Db; tenantId: string }
  >
>;

// Spelling out an option makes it required, so a host whose call id may be
// missing can't run a function that requires one.
declare function runWithoutCallIds(
  functions: ReadonlyArray<
    StandardFunctionV1<
      any,
      unknown,
      {
        context: AgentContext;
        messages: ReadonlyArray<Message>;
      }
    >
  >,
): void;
// @ts-expect-error summarize requires a call id
runWithoutCallIds([summarize]);
runWithoutCallIds([lookup, now]);

// Two frameworks whose contexts give the same key different types can't share
// a host: no context satisfies both.
declare const numericUser: StandardFunctionV1<
  Record<string, never>,
  string,
  { context: { userId: number } }
>;
// @ts-expect-error A's userId is a string
runInAgent([numericUser]);
type _conflict = Assert<
  Equal<
    StandardFunctionV1.InferOptions<
      typeof summarize | typeof numericUser
    >["context"]["userId"],
    never
  >
>;
host(
  [summarize, numericUser],
  // @ts-expect-error no userId is both a string and a number
  { callId: "call_1", context: { db, userId: "user_1" }, messages: [] },
);

// Calling a union of functions needs what every one of them needs.
declare const either: typeof summarize | typeof exportReport;
either["~standard"].execute(
  { length: 100, format: "csv" },
  {
    signal,
    callId: "call_1",
    context: { db, userId: "user_1", tenantId: "tenant_1" },
    messages: [],
    writer,
  },
);
either["~standard"].execute(
  { length: 100, format: "csv" },
  // @ts-expect-error exportReport needs a writer
  {
    signal,
    callId: "call_1",
    context: { db, userId: "user_1", tenantId: "tenant_1" },
    messages: [],
  },
);

// Options are contravariant: a function that needs less is a function that
// needs more, but not the other way around.
export const needsLess: StandardFunctionV1<any, unknown, AgentOptions> = lookup;
// @ts-expect-error summarize needs more than a database
export const needsMore: StandardFunctionV1<
  any,
  unknown,
  { context: { db: Db } }
> = summarize;

// Output is covariant: a function returning a string returns `unknown`.
export const widerOutput: StandardFunctionV1<
  Record<string, never>,
  unknown
> = now;
declare const unknownOutput: StandardFunctionV1<Record<string, never>, unknown>;
// @ts-expect-error but a function returning `unknown` doesn't return a string
export const narrowerOutput: StandardFunctionV1<
  Record<string, never>,
  string
> = unknownOutput;

// Input is invariant: it's what `execute` takes, and what `types` reports.
// So hosts accept `any` input and leave validating it to the function.
declare const stringInput: StandardFunctionV1<{ id: string }, string>;
declare const unknownInput: StandardFunctionV1<unknown, string>;
// @ts-expect-error `execute` would get input it doesn't accept
export const widerInput: StandardFunctionV1<unknown, string> = stringInput;
// @ts-expect-error `types` would report the wrong input
export const narrowerInput: StandardFunctionV1<{ id: string }, string> =
  unknownInput;
export const anyInput: StandardFunctionV1<any, string> = stringInput;

// `never` accepts every function without letting anyone run it. `any` accepts
// every function too, but lets you run one with made-up options.
declare const described: StandardFunctionV1<any, unknown, never>;
// @ts-expect-error no options are `never`
described["~standard"].execute({}, {});
export const unsafe: StandardFunctionV1<any, unknown, any> = summarize;
unsafe["~standard"].execute({}, { context: "not a context" });

// A host that never passes a context should say so: one that leaves `context`
// as `unknown` might pass anything, so it can't run a function whose context
// is optional.
declare const optionalDb: StandardFunctionV1<
  Record<string, never>,
  string,
  { context?: { db: Db } | undefined }
>;
// @ts-expect-error a plain function type allows any context
export const plainHost: StandardFunctionV1 = optionalDb;
export const noContextHost: StandardFunctionV1<
  any,
  unknown,
  { context?: undefined }
> = optionalDb;
