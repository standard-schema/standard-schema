import { v1, StandardSchema, InferOutput, InferInput } from './index.ts';


abstract class CoolSchema<T> implements v1.StandardSchema<T, T> {
  "~standard": 1; // numeric literal `1`
  "~vendor": "some-cool-schema-library"; // the name of your library
  "~types":{
    input: T;
    output: T;
  };
  
  abstract "~validate"(input: {value: unknown}): v1.StandardOutput<T>;
}

class StringSchema extends CoolSchema<string> {
  override "~validate"(input: {value: unknown}): v1.StandardOutput<string> {
    if(typeof input.value === 'string'){
      return {value: input.value};
    }
    return {issues: [{message: 'not a string'}]};
  }
}

// example usage in libraries
function acceptSchema<T extends StandardSchema>(schema: T): T   {
  // currently only the first version exists
  if(schema["~standard"] === 1){
    return schema as T;
  }
  throw new Error(`Unrecognized Standard Schema version: ${schema["~standard"]}`);
}

const someSchema = new StringSchema()

// 1. accept a user-defined schema via your API
const inputSchema = acceptSchema(someSchema); 

// 2. use the schema to validate data
const value = { name: 'Billie' };
const result = inputSchema['~validate']({ value });
if(result instanceof Promise){ 
  // handle Promise if necessary
  throw new Error('Unexpected Promise');
}
if (result.issues) {
  result.issues; // readonly StandardIssue[]
} else {
  result.value; // unknown
}

// 3. infer input and output types
type Output = InferOutput<typeof inputSchema>; // { name: string }
type Input = InferInput<typeof inputSchema>; // { name: string }