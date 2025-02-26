# Standard Schema Utils

A utils package for common operations with Standard Schema.

- [Get Dot Path](#get-dot-path)
- [Schema Error](#schema-error)
- [Basic Parsing](#basic-parsing)
  - [`parse`](#parse)
  - [`parseSync`](#parsesync)
  - [`safeParse`](#safeparse)
  - [`safeParseSync`](#safeparsesync)
- [Is Standard Schema](#is-standard-schema)
- [Get Path Segment Key](#get-path-segment-key)
- [Flatten Issues](#flatten-issues)
- [Format Issues](#format-issues)

```sh
npm install @standard-schema/utils   # npm
yarn add @standard-schema/utils      # yarn
pnpm add @standard-schema/utils      # pnpm
bun add @standard-schema/utils       # bun
deno add jsr:@standard-schema/utils  # deno
```

## Get Dot Path

To generate a dot path, simply pass an issue to the `getDotPath` function. If the issue does not contain a path or the path contains a key that is not of type `string` or `number`, the function returns `null`.

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { getDotPath } from "@standard-schema/utils";

async function getFormErrors(schema: StandardSchemaV1, data: unknown) {
  const result = await schema["~standard"].validate(data);
  const formErrors: string[] = [];
  const fieldErrors: Record<string, string[]> = {};
  if (result.issues) {
    for (const issue of result.issues) {
      const dotPath = getDotPath(issue);
      if (dotPath) {
        if (fieldErrors[dotPath]) {
          fieldErrors[dotPath].push(issue.message);
        } else {
          fieldErrors[dotPath] = [issue.message];
        }
      } else {
        formErrors.push(issue.message);
      }
    }
  }
  return { formErrors, fieldErrors };
}
```

## Schema Error

To throw an error that contains all issue information, simply pass the issues of the failed schema validation to the `SchemaError` class. The `SchemaError` class extends the `Error` class with an `issues` property that contains all the issues.

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { SchemaError } from "@standard-schema/utils";

async function validateInput<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  data: unknown
): Promise<StandardSchemaV1.InferOutput<TSchema>> {
  const result = await schema["~standard"].validate(data);
  if (result.issues) {
    throw new SchemaError(result.issues);
  }
  return result.value;
}
```

## Basic Parsing

### `parse`

Use a schema to parse asynchronously. Resolves to the parsed data, or rejects with a `SchemaError` if the data is invalid.

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { parse, SchemaError } from "@standard-schema/utils";

try {
  const parsed = await parse(schema, data);
} catch (error) {
  if (error instanceof SchemaError) {
    // handle error
  }
}
```

### `parseSync`

Use a schema to parse synchronously. Returns the parsed data, or throws a `SchemaError` if the data is invalid.
Throws a `TypeError` if the schema validation is asynchronous.

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { parseSync, SchemaError } from "@standard-schema/utils";

try {
  const parsed = parseSync(schema, data);
} catch (error) {
  if (error instanceof SchemaError) {
    // handle error
  }
  // schema validation is asynchronous
}
```

### `safeParse`

Use a schema to parse asynchronously. Resolves to a result object containing the parsed data or issues.

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { safeParse } from "@standard-schema/utils";

const result = await safeParse(schema, data);
if (result.issues) {
  // handle error
} else {
  const parsed = result.value;
}
```

### `safeParseSync`

Use a schema to parse synchronously. Returns a result object containing the parsed data or issues.
Throws a `TypeError` if the schema validation is asynchronous.

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { safeParseSync } from "@standard-schema/utils";
try {
  const result = safeParseSync(schema, data);
  if (result.issues) {
    // handle error
  } else {
    const parsed = result.value;
  }
} catch (error) {
  // schema validation is asynchronous
}
```

## Is Standard Schema

Check whether an object is a Standard Schema.

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { isStandardSchema, SchemaError } from "@standard-schema/utils";

interface Parser<Output> {
  parse(value: unknown): Output;
}

async function parseString(
  schema: Parser<string> | StandardSchemaV1<string>,
  data: unknown
) {
  if (isStandardSchema(schema)) {
    const result = await schema["~standard"].validate(data);
    if (result.issues) {
      throw new SchemaError(result.issues);
    }
    return result.value;
  }
  return schema.parse(data);
}
```

Also includes attached methods for checking specific versions.

```ts
// some point in future...
import type { StandardSchemaV1, StandardSchemaV2 } from "@standard-schema/spec";
import { isStandardSchema } from "@standard-schema/utils";

async function parseString(
  schema: StandardSchemaV1<string> | StandardSchemaV2<string>,
  data: unknown
) {
  if (isStandardSchema.v1(schema)) {
    // handle v1
  } else {
    // handle v2
  }
}
```

## Get Path Segment Key

Extract a key from a path segment, accounting for path segment objects.

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { getPathSegmentKey } from "@standard-schema/utils";

async function getIssueKeys(issue: StandardSchemaV1.Issue) {
  const keys = issue.path?.map((segment) => getPathSegmentKey(segment));
  return keys;
}
```

## Flatten Issues

Flatten issues into form and field errors. Field errors are only one level deep - deeper issues are included under their first key. (for example, `tags.0.name` issues are in `fieldIssues.tags`).

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { flattenIssues } from "@standard-schema/utils";

async function getFormErrors(schema: StandardSchemaV1, data: unknown) {
  const result = await schema["~standard"].validate(data);
  const { formIssues, fieldIssues } = flattenIssues(result.issues);
  return { formIssues, fieldIssues };
}
```

A mapper function can be passed to map issues to a different value (by default, the message is used).

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { flattenIssues } from "@standard-schema/utils";

async function getFormErrors(schema: StandardSchemaV1, data: unknown) {
  const result = await schema["~standard"].validate(data);
  const { formIssues, fieldIssues } = flattenIssues(
    result.issues,
    (issue) => issue.message
  );
  return { formIssues, fieldIssues };
}
```

For better type inference, pass the schema as the first argument.

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { flattenIssues } from "@standard-schema/utils";

async function getFormErrors<Schema extends StandardSchemaV1>(
  schema: Schema,
  data: unknown
) {
  const result = await schema["~standard"].validate(data);
  const { formIssues, fieldIssues } = flattenIssues(schema, result.issues);
  return { formIssues, fieldIssues };
}
```

## Format Issues

Formats a set of issues into a nested object. Issues will be under an `_issues` key.

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { formatIssues } from "@standard-schema/utils";

async function getFormErrors(schema: StandardSchemaV1, data: unknown) {
  const result = await schema["~standard"].validate(data);
  const fieldIssues = formatIssues(result.issues);
  return fieldIssues;
}
```

A mapper function can be passed to map issues to a different value (by default, the message is used).

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { formatIssues } from "@standard-schema/utils";

async function getFormErrors(schema: StandardSchemaV1, data: unknown) {
  const result = await schema["~standard"].validate(data);
  const fieldIssues = formatIssues(result.issues, (issue) => issue.message);
  return fieldIssues;
}
```

For better type inference, pass the schema as the first argument.

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { formatIssues } from "@standard-schema/utils";

async function getFormErrors<Schema extends StandardSchemaV1>(
  schema: Schema,
  data: unknown
) {
  const result = await schema["~standard"].validate(data);
  const fieldIssues = formatIssues(schema, result.issues);
  return fieldIssues;
}
```
