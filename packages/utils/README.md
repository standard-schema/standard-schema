# Standard Schema Utils

There are two common tasks that third-party libraries perform after validation fails. The first is to flatten the issues by creating a dot path to more easily associate the issues with the input data. This is commonly used in form libraries. The second is to throw an error that contains all the issue information. To simplify both tasks, Standard Schema also ships a utils package that provides `getDotPath` and `getJsonPointer` functions and a `SchemaError` class.

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

## Get JSON Pointer

A dot path can't tell a key containing a `.` from nested keys: `getDotPath` returns `note.title` for both `["note.title"]` and `["note", "title"]`. When the path has to leave your process, for example in an API error response, pass the issue to the `getJsonPointer` function instead. It returns a [JSON Pointer (RFC 6901)](https://www.rfc-editor.org/rfc/rfc6901), with `~` escaped as `~0` and `/` as `~1`, or `""`, the whole value, if the issue does not contain a path. If the path contains a key that is not of type `string` or `number`, the function returns `null`.

| `path`              | `getDotPath` | `getJsonPointer` |
| ------------------- | ------------ | ---------------- |
| `["note.title"]`    | `note.title` | `/note.title`    |
| `["note", "title"]` | `note.title` | `/note/title`    |
| `["note/title"]`    | `note/title` | `/note~1title`   |
| `["tags", 0]`       | `tags.0`     | `/tags/0`        |
| `[]`                | `null`       | `""`             |

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { getJsonPointer } from "@standard-schema/utils";

const getProblemErrors = async (schema: StandardSchemaV1, data: unknown) => {
  const result = await schema["~standard"].validate(data);
  return (result.issues ?? []).map((issue) => ({
    detail: issue.message,
    pointer: getJsonPointer(issue),
  }));
};
```

## Schema Error

To throw an error that contains all issue information, simply pass the issues of the failed schema validation to the `SchemaError` class. The `SchemaError` class extends the `Error` class with an `issues` property that contains all the issues.

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { SchemaError } from "@standard-schema/utils";

async function validateInput<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  data: unknown,
): Promise<StandardSchemaV1.InferOutput<TSchema>> {
  const result = await schema["~standard"].validate(data);
  if (result.issues) {
    throw new SchemaError(result.issues);
  }
  return result.value;
}
```