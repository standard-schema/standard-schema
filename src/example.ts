import type {
	StandardSchema,
	OutputType,
	InputType,
	ValidationError,
	Decorate,
} from ".";

// import { OutputType, InputType } from "standard-schema";

class StringSchema {
	"~output": string;

	// library-specific validation method
	parse(data: unknown): string {
		// do validation logic here
		if (typeof data === "string") return data;
		throw new Error("Invalid data");
	}

	// defining a ~validate method that conforms to the standard signature
	// can be private or protected
	private "~validate"(data: unknown) {
		try {
			return this.parse(data);
		} catch (err) {
			return {
				"~validationerror": true,
				issues: [
					{
						message: (err as Error)?.message,
						path: [],
					},
				],
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

const someSchema = new StringSchema(); /* some user-defined schema */

const schema = inferSchema(someSchema);
type SchemaOutput = OutputType<typeof schema>; // string
type SchemaInput = InputType<typeof schema>; // string

const data = "tuna";
const result = schema["~validate"](data);

if (isValidationError(result)) {
	result.issues; // detailed error reporting
} else {
	result.toLowerCase(); // fully typed result
}
