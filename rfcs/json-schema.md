# RFC: JSON Schema integration for Standard Schema

## Summary

This RFC proposes the addition of JSON Schema generation capabilities to the Standard Schema specification through a new `StandardJSONSchemaSourceV1` interface. This represents a new specification under the **Standard Spec** umbrella, alongside the existing `StandardSchemaV1` specification. This allows schema libraries to provide JSON Schema output while maintaining compatibility with the existing Standard Schema interface.

## Motivation

Many libraries need JSON Schema representations of type information:

- API documentation generation (e.g. OpenAPI)
- AI structured outputs
- Form generation tools
- Code generation

Currently, the Standard Schema specification only provides validation capabilities. A "schema" is a black box with an input and an output type that cannot be introspected or converted to another form.

This new proposal aims to solve that with the addition of a new spec: `StandardJSONSchemaSourceV1`.

This provides a standardized interface that can be implemented by any JavaScript object/instance/entity that can be converted into a JSON Schema representation. We expect most implementers to be schema libraries, but other libraries (ORMs, form builders, etc.) can also implement it.

```typescript
// (simplified for readability)

export interface StandardJSONSchemaSourceV1 {
  '~standard': {
    readonly toJSONSchema: (params: Options) => Record<string, unknown>;
  };
}

export interface Options {
  readonly io: 'input' | 'output';
  readonly target?:
    | 'draft-04'
    | 'draft-06'
    | 'draft-07'
    | 'draft-2019-09'
    | 'draft-2020-12';
}
```

This interface contains no affordance for data validation. That is an orthogonal concern. The two specs are independent. Think of them as "traits". Any given object/instance/entity can implement one or both.

> For convenience, the spec in `@standard-schema/spec` includes a convenience interface that combines the two "traits": `StandardSchemaV1.WithJSONSchemaSource`.

## FAQ

- input vs output
- json schema versioning
- adapter patterns: many schemas will not conform to this spec (out of the box). instead we encourage libraries to provide a standard adapter function.
