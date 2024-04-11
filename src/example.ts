import type { StandardSchema, OutputType, ValidationError, Decorate } from ".";

class BaseSchema<T> {
	"~output": T;
	validate(data: unknown): T {
		// do validation logic here
		if (Math.random() < 0.5) return data as T;
		throw new Error("Invalid data");
	}
	private "~validate"(data: unknown): T | ValidationError {
		try {
			return this.validate(data);
		} catch (err: unknown) {
			return {
				"~validationerror": true,
				issues: [{ message: (err as Error).message, path: [] }],
			};
		}
	}
}

// example usage in libraries
function inferSchema<T extends StandardSchema>(schema: T) {
	return schema as unknown as Decorate<T>;
}

function isValidationError(result: unknown): result is ValidationError {
	return (result as ValidationError)["~validationerror"] === true;
}

const someSchema = new BaseSchema<{
	name: string;
}>(); /* some user-defined schema */

const schema = inferSchema(someSchema);
const data = { name: "Billie" };
const result = schema["~validate"](data);

if (isValidationError(result)) {
	result.issues; // detailed error reporting
} else {
	result.name; // fully typed result
}
