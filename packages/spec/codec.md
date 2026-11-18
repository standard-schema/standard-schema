<h1 align="center">
  <img alt="Standard Schema fire logo" loading="lazy" width="50" height="50" decoding="async" data-nimg="1" style="color:transparent" src="https://standardschema.dev/favicon.svg">
  </br>
  Standard Codec</h1>
<p align="center">
  A common interface for bidirectional transformations
  <br/>
  <a href="https://standardschema.dev/codec">standardschema.dev/codec</a>
</p>
<br/>

<!-- start -->

Standard Codec is a common interface designed to be implemented by JavaScript and TypeScript entities that can transform data in _both_ directions.

The goal is to make it easier for ecosystem tools to accept user-defined transformations without needing to write custom logic or adapters for each supported library. And since Standard Codec is a specification, they can do so with no additional runtime dependencies.

## Motivation

Many libraries sit on a serialization boundary that has to be crossed in both directions:

- URL search params and route params
- Form data
- Cookies, `localStorage`, and other string-keyed stores
- Database columns — dates, bigints, and JSON blobs
- RPC, where the client encodes a request that the server decodes, then decodes a response that the server encoded
- Messages between workers, processes, and other realms

Standard Schema describes only the read direction. Tools that need the write direction have to hard-code an adapter per schema library, ask the user to define the inverse transform by hand, or reject transforming schemas outright. This spec provides a standardized way to run a transformation in both directions.

## The interface

The specification consists of a single TypeScript interface `StandardCodecV1` to be implemented by any library wishing to be spec-compliant.

This interface can be found below in its entirety. Libraries wishing to implement the spec can copy/paste the code block below into their codebase. It's also available at `@standard-schema/spec` on [npm](https://www.npmjs.com/package/@standard-schema/spec) and [JSR](https://jsr.io/@standard-schema/spec).

```ts
/** The Standard Typed interface. This is a base type extended by other specs. */
export interface StandardTypedV1<Input = unknown, Output = Input> {
  /** The Standard properties. */
  readonly '~standard': StandardTypedV1.Props<Input, Output>;
}

export declare namespace StandardTypedV1 {
  /** The Standard Typed properties interface. */
  export interface Props<Input = unknown, Output = Input> {
    /** The version number of the standard. */
    readonly version: 1;
    /** The vendor name of the schema library. */
    readonly vendor: string;
    /** Inferred types associated with the schema. */
    readonly types?: Types<Input, Output> | undefined;
  }

  /** The Standard Typed types interface. */
  export interface Types<Input = unknown, Output = Input> {
    /** The input type of the schema. */
    readonly input: Input;
    /** The output type of the schema. */
    readonly output: Output;
  }

  /** Infers the input type of a Standard Typed. */
  export type InferInput<Schema extends StandardTypedV1> = NonNullable<
    Schema['~standard']['types']
  >['input'];

  /** Infers the output type of a Standard Typed. */
  export type InferOutput<Schema extends StandardTypedV1> = NonNullable<
    Schema['~standard']['types']
  >['output'];
}

/** The Standard Schema interface. */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  /** The Standard Schema properties. */
  readonly '~standard': StandardSchemaV1.Props<Input, Output>;
}

export declare namespace StandardSchemaV1 {
  /** The Standard Schema properties interface. */
  export interface Props<Input = unknown, Output = Input>
    extends StandardTypedV1.Props<Input, Output> {
    /** Validates unknown input values. */
    readonly validate: (
      value: unknown,
      options?: StandardSchemaV1.Options | undefined
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

/** The Standard Codec interface. */
export interface StandardCodecV1<Input = unknown, Output = Input> {
  /** The Standard Codec properties. */
  readonly '~standard': StandardCodecV1.Props<Input, Output>;
}

export declare namespace StandardCodecV1 {
  /** The Standard Codec properties interface. */
  export interface Props<Input = unknown, Output = Input>
    extends StandardTypedV1.Props<Input, Output> {
    /** Decodes unknown values into the output type. */
    readonly decode: (
      value: unknown,
      options?: StandardCodecV1.Options | undefined
    ) => Result<Output> | Promise<Result<Output>>;
    /** Encodes unknown values into the input type. This is the inverse of `decode`. */
    readonly encode: (
      value: unknown,
      options?: StandardCodecV1.Options | undefined
    ) => Result<Input> | Promise<Result<Input>>;
  }

  /** The result interface of the decode and encode functions. */
  export type Result<Value> = StandardSchemaV1.Result<Value>;

  /** The options for the decode and encode functions. */
  export interface Options extends StandardSchemaV1.Options {}

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
```

## Design goals

The specification meets a few primary design objectives:

- **Support bidirectional transformation.** Given a Standard Codec compatible entity, you should be able to run its transformation in either direction, with errors presented in the same standardized format as Standard Schema.
- **Stand alone.** A codec doesn't have to be a schema. A schema library can implement this spec alongside Standard Schema, and a class or plain object can implement it with no schema library at all.
- **Support static type inference.** For TypeScript libraries that do type inference, the specification provides a standard way for them to "advertise" their inferred type, so it can be extracted and used by external tools.
- **Minimal.** It should be easy for libraries to implement this spec in a few lines of code that call their existing functions/methods.
- **Avoid API conflicts.** The entire spec is tucked inside a single object property called `~standard`, which avoids potential naming conflicts with the API surface of existing libraries.
- **Do no harm to DX.** The `~standard` property is tilde-prefixed to [de-prioritize it in autocompletion](https://x.com/colinhacks/status/1816860780459073933). By contrast, an underscore-prefixed property would show up before properties/methods with alphanumeric names.

## What libraries implement the spec?

These are the libraries that have already implemented the Standard Codec interface. (If you maintain a library that implements the spec, [create a PR](https://github.com/standard-schema/standard-schema/compare) to add yourself!)

| Implementer | Version(s) | Link | Notes |
| ----------- | ---------- | ---- | ----- |

## What tools / frameworks accept spec-compliant codecs?

The following tools accept user-defined codecs conforming to the Standard Codec spec. If you maintain a tool that supports Standard Codecs, [create a PR](https://github.com/standard-schema/standard-schema/compare) to add yourself!

When creating a PR to add your tool, please add a new row to the table below with:

- **Integrator**: The name of your tool/framework (as a link to your project)
- **Description**: A brief description of your tool. Should be a sentence fragment with no period at the end, e.g. ("Type-safe OpenAPI framework for Express")
- **Link**: A link to PR/commit where support was merged.

| Integrator | Description | Link |
| ---------- | ----------- | ---- |

## FAQ

These are the most frequently asked questions about Standard Codec. If your question is not listed, feel free to create an issue.

### What's the relationship between this and _Standard Schema_?

Standard Codec is _orthogonal_ to Standard Schema, the same way Standard JSON Schema is. All three share the `StandardTypedV1` base, and any given object can implement one or more of them.

A schema library that implements both Standard Schema and Standard Codec can point `decode` at the function it already uses for `validate`.

```ts
const schema = {
  '~standard': {
    version: 1,
    vendor: 'example-lib',
    validate: parse,
    decode: parse, // decoding is validation, for a schema
    encode: serialize,
  },
};
```

A consumer that needs both validation and encoding accepts the intersection, `StandardSchemaV1 & StandardCodecV1`.

### What do the two methods accept and return?

Both accept `unknown` and return the same `Result` union as Standard Schema's `validate`.

| Direction | Method   | Signature                   |
| --------- | -------- | --------------------------- |
| Decode    | `decode` | `unknown -> Result<Output>` |
| Encode    | `encode` | `unknown -> Result<Input>`  |

Either may return a `Promise`. A codec that receives a value it can't handle returns `issues` rather than throwing, in either direction.

```ts
codec['~standard'].encode('not a date');
// => { issues: [{ message: "Expected a valid Date", path: [] }] }
```

### Can a class be its own codec?

Yes. Put the codec on the class as a static `~standard` property. The class then describes both ends of its own serialization, with no schema library involved.

```ts
class Point {
  constructor(readonly x: number, readonly y: number) {}

  static readonly '~standard': StandardCodecV1.Props<[number, number], Point> = {
    version: 1,
    vendor: 'example-lib',
    decode(value) {
      if (!Array.isArray(value) || value.length !== 2 || !value.every((n) => typeof n === 'number')) {
        return { issues: [{ message: 'Expected a [number, number] tuple', path: [] }] };
      }
      return { value: new Point(value[0], value[1]) };
    },
    encode(value) {
      if (!(value instanceof Point)) {
        return { issues: [{ message: 'Expected a Point', path: [] }] };
      }
      return { value: [value.x, value.y] };
    },
  };
}

Point['~standard'].encode(new Point(1, 2)); // => { value: [1, 2] }
Point['~standard'].decode([1, 2]); // => { value: Point { x: 1, y: 2 } }
```

A transport that receives an instance, such as a worker or IPC channel, reaches its codec through `instance.constructor['~standard']`.

### Should a codec round-trip?

Yes, wherever it can. For any value that decodes successfully, encoding the result should reproduce the original input, and vice versa.

```ts
const decoded = codec['~standard'].decode(input); // { value: output }
const encoded = codec['~standard'].encode(output); // { value: input }
```

This is a semantic expectation, not something the type system enforces. Codecs that are lossy — one that trims whitespace, or one that decodes several representations into a single canonical form — should document where the round-trip breaks down.

### Why is this a separate spec instead of adding to `StandardSchemaV1`?

Adding required methods to `StandardSchemaV1` would be a breaking change for every library that implements it today, and encoding isn't universally implementable — a schema built around a one-way transform has no inverse to expose. A separate interface keeps `StandardSchemaV1` stable, lets consumers opt into requiring both directions, and lets codecs that aren't schemas implement it.

### Only some of my schemas are encodable. What should I do?

Implement `~standard.decode` and `~standard.encode` on the ones that are. Consumers that need both directions can narrow at runtime:

```ts
function isCodec<T extends StandardSchemaV1>(schema: T): schema is T & StandardCodecV1 {
  const props = schema['~standard'] as Partial<StandardCodecV1.Props>;
  return typeof props.decode === 'function' && typeof props.encode === 'function';
}
```

### My schema doesn't transform anything. Is it still a codec?

Yes, and it's the easy case. When the input and output types are identical, encoding and decoding are the same operation, so `~standard.decode` and `~standard.encode` can both delegate straight to `~standard.validate`.

### How do issue paths work in a codec?

The same way they work in Standard Schema. Each `path` is relative to the value passed to the method that produced the issue — the encoded value for `decode`, the decoded value for `encode`.

### How do I only allow synchronous codecs?

Both `~standard.decode()` and `~standard.encode()` might return a synchronous value _or_ a `Promise`, exactly like Standard Schema's `~standard.validate()`. If you only accept synchronous codecs, throw an error if the returned value is an instance of `Promise`. Libraries are encouraged to preferentially use synchronous codecs whenever possible.

### I'm a library author. How do I implement this spec?

Refer to the [implementation example](https://github.com/standard-schema/standard-schema/blob/main/packages/examples/codec-implement.ts) for a worked example.

### I want to accept codecs from a user. How do I do that?

Use the interface to accept values from the user, then run whichever direction you need.

```ts
export async function standardEncode<T extends StandardCodecV1>(
  codec: T,
  value: StandardCodecV1.InferOutput<T>
): Promise<StandardCodecV1.InferInput<T>> {
  let result = codec['~standard'].encode(value);
  if (result instanceof Promise) result = await result;

  // if the `issues` field exists, encoding failed
  if (result.issues) {
    throw new Error(JSON.stringify(result.issues, null, 2));
  }

  return result.value;
}
```

The [integration example](https://github.com/standard-schema/standard-schema/blob/main/packages/examples/codec-integrate.ts) shows both directions.
