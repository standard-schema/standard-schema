# RFC: `StandardJSONSchema`

This RFC proposes the addition of a new spec for representing JSON Schema conversion capabilities. This represents a new specification under the **Standard Spec** umbrella, alongside the existing `StandardSchemaV1` specification. This allows schema libraries to provide JSON Schema output while maintaining compatibility with the existing Standard Schema interface.

## Motivation

Many libraries need JSON Schema representations of type information:

- API documentation generation (e.g. OpenAPI)
- Tool inputs and structures outputs for AI
- Form generation tools
- Code generation

Currently, the Standard Schema specification only provides validation capabilities. A "schema" is a black box with an input and an output type that cannot be introspected or converted to another form.

## The spec

This new proposal aims to solve that with the addition of a new spec: `StandardJSONSchemaV1`.

This provides a standardized interface that can be implemented by any JavaScript object/instance/entity that can be converted into a JSON Schema representation. We expect most implementers to be schema libraries, but other libraries (ORMs, form builders, etc.) can also implement it.

```typescript
// condensed for readability
export interface StandardJSONSchemaV1<Input = unknown, Output = Input> {
  '~standard': {
    readonly version: 1;
    readonly vendor: string;
    readonly types?: {
      readonly input: Input;
      readonly output: Output;
    };
    readonly jsonSchema: {
      input: (params?: Options) => Record<string, unknown>;
      output: (params?: Options) => Record<string, unknown>;
    };
  };
}

export interface Options {
  readonly target?:
    | 'draft-04'
    | 'draft-06'
    | 'draft-07'
    | 'draft-2019-09'
    | 'draft-2020-12'
    | 'openapi-3.0'
    | ({} & string); // allow for future versions
  /** Implicit support for additional vendor-specific parameters. */
  [k: string]: unknown;
}
```

This interface contains no affordance for data validation. That is an orthogonal concern. The two specs are independent. Think of them as "traits". Any given object/instance/entity can implement one or both.

> For convenience, the spec in `@standard-schema/spec` includes a convenience interface that combines the two "traits": `StandardSchemaV1.WithJSONSchema`.

## FAQ

### Why multiple `target` values?

Different tooling requires different versions of JSON Schema. Currently there is a divide in the ecosystem between `"draft-07"` and `"draft-2020-12"`. Library authors that implement this spec are encouraged to implement as many formats as is practical, which a special emphasis on `"draft-07"` and `"draft-2020-12"`. Supporting multiple formats is not required to implement the spec; it is entirely on a best-effort basis.

### Does the spec account for future versions of JSON Schema?

Yes, the type signature for `"target"` was intentionally widened with `{} & string`. This allows libraries to support unspecified formats. It also allows the spec to evolve to include future versions of JSON Schema without breaking assignability down the line.

### What's `"openapi-3.0"`?

The OpenAPI 3.0 specification (still in wide use) implements its own schema definition format. It's a superset of JSON Schema `"draft-04"` that's augmented with additional keywords like `nullable`. Despite not being an official JSON Schema draft, it's in wide use and has been included in the list of recommended drafts.

### Why both `jsonSchema.input` and `jsonSchema.output`?

Many schemas perform transformations during validation. For example, a schema might accept a string as input (`"123"`) but output a number (`123`). The input and output types can differ, so their JSON Schema representations need to differ as well. The `inputSchema` method generates a JSON Schema for the input type, while `outputSchema` generates one for the output type. In cases where input and output types are identical, both methods will return the same schema.

### What about error handling?

If a given schema/entity cannot be converted to JSON Schema, the associated converter function may throw. Any consuming libraries should plan accordingly.

### Why is this a separate spec instead of adding to `StandardSchemaV1`?

The two concerns are orthogonal. `StandardSchemaV1` is about validation, while `StandardJSONSchemaV1` is about introspectability and JSON Schema generation. Keeping them separate allows greater flexibility.

- Libraries can implement one or the other, or both. For instance, ORMs or form builders may only need to generate schemas, not validate.
- Schema libraries can opt into JSON Schema support independently.

### What if I want to accept only schemas that implement both `StandardSchema` and `StandardJSONSchema`?

<!-- For convenience, the spec provides a convenience interface `StandardJSONSchemaV1.WithStandardSchema` that merges the two interfaces. You can also do this yourself as needed. -->

The two specs are implemented as plain TypeScript interfaces, so you can merge them (and any future specs) as needed for your use case.

```ts
export interface CombinedProps<Input = unknown, Output = Input>
  extends StandardSchemaV1.Props<Input, Output>,
    StandardJSONSchemaV1.Props<Input, Output> {}

/**
 * An interface that combines StandardJSONSchema and StandardSchema.
 * */
export interface CombinedSpec<Input = unknown, Output = Input> {
  '~standard': CombinedProps<Input, Output>;
}
```
