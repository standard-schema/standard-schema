export interface StandardSchema {
	"~output": unknown;
}

export interface ValidationError {
	"~validationerror": true;
	issues: Issue[];
}

export interface Issue {
	message: string;
	path: (string | number | symbol)[];
}

export type OutputType<T extends StandardSchema> = T["~output"];
export type InputType<T extends StandardSchema> = T extends {
	"~input": infer I;
}
	? I
	: OutputType<T>; // defaults to output type

export type Decorate<T extends StandardSchema> = {
	"~output": OutputType<T>;
	"~input": InputType<T>;
	"~validate"(data: unknown): OutputType<T> | ValidationError;
};
// export function standardizeSchema<T extends StandardSchema>(
// 	schema: T,
// ): Decorate<T> {
// 	return schema as unknown as Decorate<T>;
// }

export function isValidationError(result: unknown): result is ValidationError {
	return (result as ValidationError)["~validationerror"] === true;
}
