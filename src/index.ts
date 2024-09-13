export interface StandardSchema<Input = unknown, Output = unknown> {
  '~standard': number; // version number
  '~types'?: StandardTypes<Input, Output>;
}

export interface StandardTypes<Input, Output> {
  input: Input;
  output: Output;
}

export type OutputType<T extends StandardSchema> = NonNullable<
  T['~types']
>['output'];

export type InputType<T extends StandardSchema> = NonNullable<
  T['~types']
>['output'];

export type StandardSchemaVersioned = v1.Schema /* ... */;

export namespace v1 {
  export interface Schema<Input = unknown, Output = unknown>
    extends StandardSchema<Input, Output> {
    '~standard': 1;
    '~validate': Validate<Output>;
  }

  export type Validate<Output> = (
    input: Input,
    ...args: any[]
  ) => Result<Output>;

  export interface Types<Input, Output> {
    input: Input;
    output: Output;
  }

  export interface Input {
    value: unknown;
  }

  export type Result<Output> = SuccessResult<Output> | FailureResult;

  export interface SuccessResult<Output> {
    value: Output;
    issues?: never;
  }

  export interface FailureResult {
    value?: unknown;
    issues: ReadonlyArray<Issue>;
  }

  export interface Issue {
    message: string;
    path?: ReadonlyArray<
      | PropertyKey
      | {
          key: PropertyKey;
        }
    >;
  }
}

// example usage in libraries
import { CoolSchema } from 'some-cool-schema-library';

function inferSchema<T extends StandardSchema>(
  schema: T
): StandardSchemaVersioned {
  return schema as unknown as StandardSchemaVersioned;
}

const someSchema: CoolSchema<{ name: string }> = new CoolSchema();
const inferredSchema = inferSchema(someSchema);
const value = { name: 'Billie' };

if (inferredSchema['~standard'] === 1) {
  const result = inferredSchema['~validate']({ value });
  if (result.issues) {
    result.issues; // readonly StandardIssue[]
  } else {
    result.value; // unknown
  }
} else {
  throw new Error('Unsupported StandardSchema version');
}

class StringSchema implements StandardSchema {
  '~standard' = 1;
  '~types': { output: string; input: string };
  // defining a ~validate method that conforms to the standard signature
  private '~validate' = ((input: { value: unknown }) => {
    if (typeof input.value === 'string') return { value: input.value };
    return {
      issues: [
        {
          message: 'invalid type',
          path: [],
        },
      ],
    };
  }) satisfies v1.Validate<this['~types']['output']>;
}
