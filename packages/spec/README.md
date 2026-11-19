<h1 align="center">
  <img alt="Standard Schema fire logo" loading="lazy" width="50" height="50" decoding="async" data-nimg="1" style="color:transparent" src="https://standardschema.dev/favicon.svg">
  </br>
  Standard Schema</h1>
<p align="center">
  A family of specs for interoperable TypeScript
  <br/>
  <a href="https://standardschema.dev">standardschema.dev</a>
</p>
<br/>

<!-- start -->

The Standard Schema project is a set of interfaces that standardize the provision and consumption of shared functionality in the TypeScript ecosystem.

Its goal is to allow libraries to accept a single input that includes all the types and capabilities they need— no library-specific adapters, no extra dependencies. The result is an ecosystem that's fair for implementers, friendly for consumers, and open for end users.

## The specifications

The specifications can be found below in their entirety. Libraries wishing to implement a spec can copy/paste the code block below into their codebase. They're also available at `@standard-schema/spec` on [npm](https://www.npmjs.com/package/@standard-schema/spec) and [JSR](https://jsr.io/@standard-schema/spec).

```ts
// #########################
// ###   Standard Typed  ###
// #########################

/** The Standard Typed interface. This is a base type extended by other specs. */
export interface StandardTypedV1<Input = unknown, Output = Input> {
  /** The Standard properties. */
  readonly "~standard": StandardTypedV1.Props<Input, Output>;
}

export declare namespace StandardTypedV1 {
  /** The Standard Typed properties interface. */
  export interface Props<Input = unknown, Output = Input> {
    /** The version number of the standard. */
    readonly version: 1;
    /** The name of the library that implements this interface. */
    readonly vendor: string;
    /** Inferred types associated with this entity. */
    readonly types?: Types<Input, Output> | undefined;
  }

  /** The Standard Typed types interface. */
  export interface Types<Input = unknown, Output = Input> {
    /** The input type of this entity. */
    readonly input: Input;
    /** The output type of this entity. */
    readonly output: Output;
  }

  /** Infers the input type of a Standard Typed. */
  export type InferInput<Schema extends StandardTypedV1> = NonNullable<
    Schema["~standard"]["types"]
  >["input"];

  /** Infers the output type of a Standard Typed. */
  export type InferOutput<Schema extends StandardTypedV1> = NonNullable<
    Schema["~standard"]["types"]
  >["output"];
}

// ##########################
// ###   Standard Schema  ###
// ##########################

/** The Standard Schema interface. */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  /** The Standard Schema properties. */
  readonly "~standard": StandardSchemaV1.Props<Input, Output>;
}

export declare namespace StandardSchemaV1 {
  /** The Standard Schema properties interface. */
  export interface Props<Input = unknown, Output = Input>
    extends StandardTypedV1.Props<Input, Output> {
    /** Validates unknown input values. */
    readonly validate: (
      value: unknown,
      options?: StandardSchemaV1.Options | undefined,
    ) => Result<Output> | Promise<Result<Output>>;
  }

  /** The result interface of the validate function. */
  export type Result<Output> = SuccessResult<Output> | FailureResult;

  /** The result interface if validation succeeds. */
  export interface SuccessResult<Output> {
    /** The typed output value. */
    readonly value: Output;
    /** A falsy value for `issues` indicates success. */
    readonly issues?: undefined;
  }

  export interface Options {
    /** Explicit support for additional vendor-specific parameters, if needed. */
    readonly libraryOptions?: Record<string, unknown> | undefined;
  }

  /** The result interface if validation fails. */
  export interface FailureResult {
    /** The issues of failed validation. */
    readonly issues: ReadonlyArray<Issue>;
  }

  /** The issue interface of the failure output. */
  export interface Issue {
    /** The error message of the issue. */
    readonly message: string;
    /** The path of the issue, if any. */
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
  }

  /** The path segment interface of the issue. */
  export interface PathSegment {
    /** The key representing a path segment. */
    readonly key: PropertyKey;
  }

  /** The Standard types interface. */
  export interface Types<Input = unknown, Output = Input>
    extends StandardTypedV1.Types<Input, Output> {}

  /** Infers the input type of a Standard. */
  export type InferInput<Schema extends StandardTypedV1> =
    StandardTypedV1.InferInput<Schema>;

  /** Infers the output type of a Standard. */
  export type InferOutput<Schema extends StandardTypedV1> =
    StandardTypedV1.InferOutput<Schema>;
}

// ###############################
// ###   Standard JSON Schema  ###
// ###############################

/** The Standard JSON Schema interface. */
export interface StandardJSONSchemaV1<Input = unknown, Output = Input> {
  /** The Standard JSON Schema properties. */
  readonly "~standard": StandardJSONSchemaV1.Props<Input, Output>;
}

export declare namespace StandardJSONSchemaV1 {
  /** The Standard JSON Schema properties interface. */
  export interface Props<Input = unknown, Output = Input>
    extends StandardTypedV1.Props<Input, Output> {
    /** Methods for generating the input/output JSON Schema. */
    readonly jsonSchema: StandardJSONSchemaV1.Converter;
  }

  /** The Standard JSON Schema converter interface. */
  export interface Converter {
    /** Converts the input type to JSON Schema. May throw if conversion is not supported. */
    readonly input: (
      options: StandardJSONSchemaV1.Options,
    ) => Record<string, unknown>;
    /** Converts the output type to JSON Schema. May throw if conversion is not supported. */
    readonly output: (
      options: StandardJSONSchemaV1.Options,
    ) => Record<string, unknown>;
  }

  /**
   * The target version of the generated JSON Schema.
   *
   * It is *strongly recommended* that implementers support `"draft-2020-12"` and `"draft-07"`, as they are both in wide use. All other targets can be implemented on a best-effort basis. Libraries should throw if they don't support a specified target.
   *
   * The `"openapi-3.0"` target is intended as a standardized specifier for OpenAPI 3.0 which is a superset of JSON Schema `"draft-04"`.
   */
  export type Target =
    | "draft-2020-12"
    | "draft-07"
    | "openapi-3.0"
    // Accepts any string: allows future targets while preserving autocomplete
    | ({} & string);

  /** The options for the input/output methods. */
  export interface Options {
    /** Specifies the target version of the generated JSON Schema. Support for all versions is on a best-effort basis. If a given version is not supported, the library should throw. */
    readonly target: Target;

    /** Explicit support for additional vendor-specific parameters, if needed. */
    readonly libraryOptions?: Record<string, unknown> | undefined;
  }

  /** The Standard types interface. */
  export interface Types<Input = unknown, Output = Input>
    extends StandardTypedV1.Types<Input, Output> {}

  /** Infers the input type of a Standard. */
  export type InferInput<Schema extends StandardTypedV1> =
    StandardTypedV1.InferInput<Schema>;

  /** Infers the output type of a Standard. */
  export type InferOutput<Schema extends StandardTypedV1> =
    StandardTypedV1.InferOutput<Schema>;
}

// ########################
// ###   Standard Tool  ###
// ########################

/** The Standard Tool interface. */
export interface StandardToolV1<
  Input = any,
  Output = unknown,
  Context = unknown,
> {
  /** The Standard Tool properties. */
  readonly "~standard": StandardToolV1.Props<Input, Output, Context>;
}

export declare namespace StandardToolV1 {
  /** The Standard Tool properties interface. */
  export interface Props<Input = any, Output = unknown, Context = unknown>
    extends StandardTypedV1.Props<Input, Output> {
    /** The name of the tool. Set to "" if it has none. */
    readonly name: string;
    /** A description of what the tool does. Set to "" if it has none. */
    readonly description: string;
    /** The schema of the tool's input, whose output type is the `Input` that `execute` takes. If it also implements Standard Schema, callers can validate with it. */
    readonly input: StandardJSONSchemaV1<unknown, Input>;
    /** The schema of the tool's output, if any, whose input type is the `Output` that `execute` resolves to. If it also implements Standard Schema, callers can validate with it. */
    readonly output?: StandardJSONSchemaV1<Output, unknown> | undefined;
    /**
     * Runs the tool. Does not validate: the caller must pass an input matching `Input`, like the `value` returned by the `input` schema's `validate`.
     *
     * Resolves to the output, or to a failure the tool chose to report, which is safe to show a model. Rejects if something unexpected happens, and the error may contain internal details.
     */
    readonly execute: (
      input: Input,
      ...options: ExecuteOptions<Context>
    ) => Promise<StandardSchemaV1.Result<Output>>;
  }

  /** The type of a tool's `execute` function. */
  export type ExecuteFunction<
    Input = any,
    Output = unknown,
    Context = unknown,
  > = Props<Input, Output, Context>["execute"];

  /** A Standard Tool whose `input` also implements Standard Schema, so a caller can validate input with it before calling `execute`. */
  export type Validatable<
    Input = any,
    Output = unknown,
    Context = unknown,
  > = StandardToolV1<Input, Output, Context> & {
    readonly "~standard": {
      readonly input: StandardSchemaV1<unknown, Input>;
    };
  };

  /** The options callers pass as the second argument of `execute`. */
  export interface Options<Context = unknown> {
    /** Aborted when the caller no longer needs the result, so the tool can stop its work early. */
    readonly signal?: AbortSignal | undefined;
    /** The identifier of the call, such as the id a model assigned to it. Omitted if the caller has none. */
    readonly callId?: string | undefined;
    /** What the tool needs from its caller to run, like a database client or the current user. Callers pass their own object as-is. */
    readonly context?: Context | undefined;
  }

  /** The parameters of `execute` after `input`: an options object, required along with its `context` unless `Context` includes `undefined`. */
  export type ExecuteOptions<Context = unknown> = undefined extends Context
    ? [options?: Options<Context> | undefined]
    : [options: Options<Context> & { readonly context: Context }];

  /** The environment's built-in `AbortSignal` type, or `any` if it can't be detected. */
  export type AbortSignal = typeof globalThis extends {
    AbortSignal: { prototype: infer Signal };
  }
    ? Signal
    : any;

  /** The Standard Tool types interface. */
  export interface Types<Input = unknown, Output = unknown>
    extends StandardTypedV1.Types<Input, Output> {}

  /** Infers the input type of a Standard Tool: what `execute` takes, which is the output type of its `input` schema. */
  export type InferInput<Tool extends StandardToolV1<any, unknown, never>> =
    Tool extends StandardToolV1<infer Input, unknown, never> ? Input : never;

  /** Infers the output type of a Standard Tool: what `execute` resolves to, which is the input type of its `output` schema. */
  export type InferOutput<Tool extends StandardToolV1<any, unknown, never>> =
    Tool extends StandardToolV1<any, infer Output, never> ? Output : never;

  /** Infers the context type of a Standard Tool. For a union of tools, infers the context needed to run all of them. */
  export type InferContext<Tool extends StandardToolV1<any, unknown, never>> = (
    Tool extends StandardToolV1<any, unknown, infer Context>
      ? (context: Context) => void
      : never
  ) extends (context: infer Context) => void
    ? Context
    : never;
}
```
