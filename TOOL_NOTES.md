# Standard Tool: notes on the proposals

These notes explain the current `tool` branch and how it compares to the other two proposals. Links are pinned to the commits reviewed.

- **[#193](https://github.com/standard-schema/standard-schema/pull/193)** (Fabian): `StandardToolV1`, reviewed at `bf6791d`
- **[#194](https://github.com/standard-schema/standard-schema/pull/194)** (Colin): `StandardFunctionV1`, reviewed at `138ea3f`

The overall concern is that we're solving too many problems at once. This branch starts from the smallest tool contract, and new capabilities can be added when a real integrator needs them.

## The shape

```ts
export interface Props<Input = any, Output = unknown, Context = unknown>
  extends StandardTypedV1.Props<Input, Output> {
  readonly name: string; // "" if none
  readonly description: string; // "" if none
  readonly input: StandardJSONSchemaV1<unknown, Input>;
  readonly output?: StandardJSONSchemaV1<Output, unknown> | undefined;
  readonly execute: (
    input: Input,
    ...options: ExecuteOptions<Context>
  ) => Promise<StandardSchemaV1.Result<Output>>;
}
```

Full definition: [`packages/spec/src/index.ts`](packages/spec/src/index.ts). Docs: [`packages/spec/tool.md`](packages/spec/tool.md).

## `execute` doesn't validate

When and how validation happens is an overstep for this spec. Validation already has a standard, so a tool should compose with it.

- **#193** requires the tool to validate its input and output: [`execute`'s contract](https://github.com/standard-schema/standard-schema/blob/bf6791dcfdf2ef5fd9ea167bf109cb061d47edcf/packages/spec/src/index.ts#L188-L191), [rationale](https://github.com/standard-schema/standard-schema/blob/bf6791dcfdf2ef5fd9ea167bf109cb061d47edcf/packages/spec/tool.md#L311).
- **#194** says a function built from a schema library should validate its input: [FAQ](https://github.com/standard-schema/standard-schema/blob/138ea3ff1b3d1359aaf7906529370bcf8b7d8f49/packages/spec/function.md#L333).
- **This branch:** "`execute` does not validate. Callers must pass input matching `Input`, using a validator if the value isn't already known to match."

A framework that takes model arguments accepts a validating schema and needs only a few lines:

```ts
type ValidatedTool<Input, Output> = StandardToolV1<Input, Output> & {
  readonly "~standard": { readonly input: StandardSchemaV1<unknown, Input> };
};

async function runTool<Input, Output>(
  tool: ValidatedTool<Input, Output>,
  args: unknown,
) {
  const { input, execute } = tool["~standard"];
  const result = await input["~standard"].validate(args);
  if (result.issues) return result;
  return execute(result.value);
}
```

This means nothing is validated twice, and transforming schemas just work because `execute` receives the parsed value.

The cost is that a framework that skips validation passes bad model input to `execute`, and the compiler won't catch a framework that accepts plain JSON Schema slots. This is the counterpoint to #193's "behaves the same in every library". Under this rule, that framework is non-compliant.

## `input` and `output` slots, from #193

This is the main thing to take from [#193's interface](https://github.com/standard-schema/standard-schema/blob/bf6791dcfdf2ef5fd9ea167bf109cb061d47edcf/packages/spec/src/index.ts#L184-L186), and it replaces this branch's earlier `extends StandardJSONSchemaV1.Props`, which [#194 also uses](https://github.com/standard-schema/standard-schema/blob/138ea3ff1b3d1359aaf7906529370bcf8b7d8f49/packages/spec/src/index.ts#L178-L183).

A tool could instead be its own input validator, and that does work:

```ts
type AcceptedTool<In, Out> = StandardToolV1<In, Out> &
  StandardSchemaV1<unknown, In>;
```

But a root object fits only one validator, so it can't validate both input and output.

- **Root object:** no new fields, but input only, and `types.output` becomes `Out & In`.
- **Slots:** both sides can validate and there's no type collision, but it adds two fields and drops the `extends`.

Each slot is a Standard JSON Schema and can also be a Standard Schema where a framework needs validation.

**`input` is required.** A tool whose input can't be introspected has no use over a plain function, since nothing can describe it to a model. **`output` stays optional**, because a model doesn't need it to call the tool. Output also comes from the tool's own code rather than across a trust boundary, so a tool can check it inside `execute`.

**Type parameters differ from #193.** `Input` and `Output` describe `execute`, so the far side of each schema stays open. #193 has them the other way round, `<Input, unknown>` and `<unknown, Output>`, which is right for its contract because its `execute` validates internally.

```
model arguments -> input schema -> Input -> execute -> Output -> output schema -> caller
```

The spec only names two of the four types, and frameworks can infer the outer two from the slots. The cost is that `InferInput` and `InferOutput` give `execute`'s types.

## Result shape, without `source` or `FunctionFailure`

The result shape comes from both PRs, but this branch reuses `StandardSchemaV1.Result` as it is.

```ts
async function execute(input: { amount: number }) {
  try {
    return { value: await charge(input) };
  } catch (error) {
    if (error instanceof CardDeclined) {
      return { issues: [{ message: "The payment was declined" }] };
    }
    throw error;
  }
}
```

The `catch` is the natural place to filter what gets exposed.

- **No `source`.** [#193](https://github.com/standard-schema/standard-schema/blob/bf6791dcfdf2ef5fd9ea167bf109cb061d47edcf/packages/spec/src/index.ts#L203) and [#194](https://github.com/standard-schema/standard-schema/blob/138ea3ff1b3d1359aaf7906529370bcf8b7d8f49/packages/spec/src/index.ts#L230) need one because `execute` validates. Here the framework calls `validate` and `execute` separately, so it already knows which one failed.
- **No [`FunctionFailure`](https://github.com/standard-schema/standard-schema/blob/138ea3ff1b3d1359aaf7906529370bcf8b7d8f49/packages/utils/src/FunctionFailure/FunctionFailure.ts).** It is only needed because [#194's factory](https://github.com/standard-schema/standard-schema/blob/138ea3ff1b3d1359aaf7906529370bcf8b7d8f49/packages/utils/src/createStandardFunctionFactory/createStandardFunctionFactory.ts#L107-L113) has `execute` return a raw output, so it throws in order to return a failure. The spec package is types only, and this makes failure behavior depend on an `instanceof` check against a runtime class, which also fails if two copies of the package are installed.

Wrapping an existing function takes one line: `async (input) => ({ value: await fn(input) })`.

[#194's distinction](https://github.com/standard-schema/standard-schema/blob/138ea3ff1b3d1359aaf7906529370bcf8b7d8f49/packages/spec/function.md#L337) between failures that are safe to show a caller and unexpected errors is a real one, and this branch's docs adopt it. A result doesn't fix leaks by itself, though: the AI SDK sends thrown error messages to the model today ([`errorMode: 'text'`](https://github.com/vercel/ai/blob/main/packages/ai/src/generate-text/to-response-messages.ts)), so a framework has to choose to stop.

## Async only

```ts-diff
-  ) => Result<Output> | Promise<Result<Output>>;
+  ) => Promise<StandardSchemaV1.Result<Output>>;
```

Both PRs keep the union, apparently for parity with `validate`, and neither gives a use case for it beyond [a FAQ on rejecting async](https://github.com/standard-schema/standard-schema/blob/138ea3ff1b3d1359aaf7906529370bcf8b7d8f49/packages/spec/function.md#L476). Tools nearly always do I/O and callers always await. This is a preference rather than something measured, and a sync function needs `async (input) => ({ value: fn(input) })`.

## Options: `{ signal, callId, context }`

`signal` and `callId` are the spec's own, and `context` is its own key, so a host's context passes through unchanged with its identity and prototype intact. All three proposals agree on these keys.

This branch keeps `ExecuteOptions`, the conditional type, because it's the only shape that requires neither `{}` nor giving up the type check:

```ts
// this branch: conditional tuple
aDb.execute("x"); // error: context is required
aNone.execute("x"); // ok

// #193: options always optional
bDb.execute("x"); // compiles, then fails at runtime without its context
bNone.execute("x"); // ok

// #194: options always required
fDb.execute("x", {}); // error: context is required
fNone.execute("x"); // error: needs {}
fNone.execute("x", {}); // ok
```

All of these reject a tool needing more context than the host provides, accept one needing less, and accept every tool for describing with `never`. That was checked with `tsc`.

**[Sibling framework options in #194](https://github.com/standard-schema/standard-schema/blob/138ea3ff1b3d1359aaf7906529370bcf8b7d8f49/packages/spec/function.md#L385)** (`{ context, writer }`) keep the app's context intact when a host adds its own values. That's a real but small edge, it costs the `{}`, and it can be added later without breaking anything, so it's out of V1.

## `InferContext`, from #194

[#194's `InferOptions`](https://github.com/standard-schema/standard-schema/blob/138ea3ff1b3d1359aaf7906529370bcf8b7d8f49/packages/spec/function.md#L423) showed a bug here: on a union of tools this branch's `InferContext` gave `Db | User`, but a host must provide both. It now gives `Db & User`, and one tool's `Db | undefined` stays intact.

```ts
function defineAgent<
  const Tools extends ReadonlyArray<StandardToolV1<any, unknown, never>>,
>(config: {
  tools: Tools;
  context: StandardToolV1.InferContext<Tools[number]>;
}) {
  // ...
}
```

`Input = any` is also shared with #194, instead of #193's `unknown`. `execute` takes `Input`, so `StandardToolV1<unknown>` would reject a tool with a specific input.

## Example: the AI SDK accepting a Standard Tool directly

No wrapper is needed for users, and it works because the SDK already understands `~standard`.

```ts
await generateText({ model, prompt, tools: { weather: getWeather } });

// inside the SDK, where `tools` enters
const normalizeTool = (t) =>
  "~standard" in t
    ? {
        ...t,
        description: t["~standard"].description,
        inputSchema: t["~standard"].input,
        execute: async (input, { abortSignal, toolCallId, context }) => {
          const result = await t["~standard"].execute(input, {
            signal: abortSignal,
            callId: toolCallId,
            context,
          });
          if (result.issues) throw new ToolFailure(result);
          return result.value;
        },
      }
    : t;
```

`asSchema` [already reads](https://github.com/vercel/ai/blob/main/packages/provider-utils/src/schema.ts) `~standard.jsonSchema.input` and `~standard.validate`, and both `prepare-tools.ts` and `parse-tool-call.ts` go through it. So JSON Schema generation and validation need no new code, and nothing is inferred from JSON Schema. SDK features stay next to `~standard`: `{ ...getWeather, needsApproval: true }`.

The sketch needs three more things: a `ToolSet` union member, a `StandardToolV1` branch in `InferToolInput`, `InferToolOutput` and `InferToolContext`, and a host-side `ToolFailure` (illustrative). `asSchema` calls `validate` unconditionally, so a JSON-only slot needs a check. It also routes `vendor === "zod"` to its Zod path.

## Streaming

[#194's `executeStream`](https://github.com/standard-schema/standard-schema/blob/138ea3ff1b3d1359aaf7906529370bcf8b7d8f49/packages/spec/src/index.ts#L194-L199) isn't on this branch, but it's worth considering for exactly one case:

```ts
execute: (input) => Promise<A>;
executeStream: (input) => AsyncIterable<A>; // each value is a complete snapshot; the last is final
```

This matches the AI SDK's [preliminary and final tool results](https://github.com/vercel/ai/blob/main/packages/provider-utils/src/types/execute-tool.ts). [#194's docs](https://github.com/standard-schema/standard-schema/blob/138ea3ff1b3d1359aaf7906529370bcf8b7d8f49/packages/spec/function.md#L456) also allow rows or deltas, but anything other than snapshots breaks the matching signatures: if `execute` returned `Row[]`, every yield would have to be `Row[]` too. Every intermediate value must also satisfy `A`, and a token stream would re-send all its accumulated text each time.

It's an optional field, so leaving it out of V1 and adding it later is also fine.

## Name

`StandardFunction` overclaims. The shape is limited to one input plus options, with a name, a description and an introspectable input, and that is a tool.

## Open

- **Utils:** [#193's factories](https://github.com/standard-schema/standard-schema/blob/bf6791dcfdf2ef5fd9ea167bf109cb061d47edcf/packages/utils/src/createStandardToolFactory/createStandardToolFactory.ts) mostly exist to run validation, so a non-validating `execute` barely needs them. This branch has none. #193's [adoption path](https://github.com/standard-schema/standard-schema/blob/bf6791dcfdf2ef5fd9ea167bf109cb061d47edcf/packages/examples/tool-extend.ts), where AI libraries add `~standard` to their existing `tool()`, still applies and gets simpler.
- **Other changes on this branch:** `meta`, `FailureResult.message` and the JSON Schema wording are unrelated to the tool interface and both PRs left them out. They could move to a separate PR.

## Verification

- **Checked:** `tsc` and `biome` on the spec and examples, and [`tool-integrate.ts`](packages/examples/tool-integrate.ts) run with `node` against a hand-written tool: valid input, invalid input without running the tool, a returned failure, a thrown error not reaching the model, and context identity.
- **Not checked:** the slots with current Zod or ArkType, because this repo pins older versions without `jsonSchema`; Valibot needs `toStandardJsonSchema`; and the AI SDK sketch against its real types.
