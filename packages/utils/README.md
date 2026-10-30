# Standard Schema Utils

There are two common tasks that third-party libraries perform after validation fails. The first is to flatten the issues by creating a dot path to more easily associate the issues with the input data. This is commonly used in form libraries. The second is to throw an error that contains all the issue information. To simplify both tasks, Standard Schema also ships a utils package that provides a `getDotPath` function and a `SchemaError` class. It also provides a `createStandardToolFactory` and a `createStandardTool` function to create [Standard Tools](https://standardschema.dev/tool).

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
  data: unknown,
): Promise<StandardSchemaV1.InferOutput<TSchema>> {
  const result = await schema["~standard"].validate(data);
  if (result.issues) {
    throw new SchemaError(result.issues);
  }
  return result.value;
}
```

## Create Standard Tool Factory

AI libraries can use `createStandardToolFactory` to add [Standard Tool](https://standardschema.dev/tool) to the tools returned by their existing tool function. Their API stays the same, their users don't need to install this package, and the tools can be executed by any library that supports the spec.

```ts
import { createStandardToolFactory } from "@standard-schema/utils";

const createStandardTool = createStandardToolFactory("my-ai-lib");

export function tool(config) {
  const standardTool = createStandardTool({
    description: config.description,
    input: config.inputSchema,
    // map the options of the spec to the options of your API
    execute: (input, options) =>
      config.execute(input, {
        toolCallId: options.callId ?? "",
        abortSignal: options.signal,
        context: options.context,
      }),
  });
  return { ...config, ...standardTool };
}
```

The created `~standard` property validates the input before running the tool and its output afterwards. Both schemas must implement Standard Schema and Standard JSON Schema. Invalid input or output is returned as issues with the source `"input"` or `"output"`.

If your library doesn't have its own tool function yet, you can also export the created function directly:

```ts
export const createStandardTool = createStandardToolFactory("my-ai-lib");
```

## Create Standard Tool

If your AI library doesn't support Standard Tool yet, use `createStandardTool` to create tools directly. It uses `"standard-schema"` as its vendor, and the types of the tool are inferred from its schemas.

```ts
import { createStandardTool } from "@standard-schema/utils";
import { type } from "arktype";
import { toStandardJsonSchema } from "@valibot/to-json-schema";
import * as v from "valibot";

const getWeather = createStandardTool({
  name: "get_weather",
  description: "Get the current temperature in a city, in degrees Celsius",
  input: type({ city: "string" }),
  output: toStandardJsonSchema(
    v.object({ city: v.string(), temperature: v.number() }),
  ),
  async execute({ city }, { signal }) {
    const response = await fetch(`https://example.com/weather/${city}`, {
      signal,
    });
    const { temperature } = await response.json();
    return { city, temperature };
  },
});
```

Any library that supports the spec can then execute the tool:

```ts
const result = await getWeather["~standard"].execute({ city: "Berlin" });
if (result.issues) {
  // `result.source` is `"input"` if the tool did not run, or `"output"`
} else {
  // the validated output is in `result.value`
}
```
