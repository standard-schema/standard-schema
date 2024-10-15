# Changelog

All notable changes to the library will be documented in this file.

## v1.0.0-beta.2 (October 15, 2024)

- The `~types` property is now required
- `InferInput` and `InferOutput` have been removed, as they can now be trivially accessed as `schema["~types"]["input"]` and `schema["~types"]["output"]`, respectively

## v1.0.0 (Month DD, YYYY)

- Initial release
