# Changelog

All notable changes to the library will be documented in this file.

## Unreleased

- Add Standard Tool (`StandardToolV1`), for tools that describe themselves with Standard JSON Schema and can be called by AI models
- Add optional `message` to `StandardSchemaV1.FailureResult`, a human-readable summary of the failure

## v1.1.0 (December 15, 2025)

- Add Standard Typed (`StandardTypedV1`), a base interface extended by the other specs
- Add Standard JSON Schema (`StandardJSONSchemaV1`)
- Add an optional second argument to `StandardSchemaV1`'s `validate`, for vendor-specific `libraryOptions`

## v1.0.0 (January 26, 2025)

- Initial release
