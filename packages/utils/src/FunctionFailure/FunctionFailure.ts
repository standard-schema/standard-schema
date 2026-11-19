/**
 * A failure a Standard Function reports to its caller. Throw it in a function
 * created with `createStandardFunction` to return a failure with the source
 * `"execution"` instead of throwing.
 */
export class FunctionFailure extends Error {
  /**
   * Creates a failure a Standard Function reports to its caller.
   *
   * @param message The message of the failure. It is shown to the caller, so
   * it must not contain internal details.
   */
  constructor(message: string) {
    super(message);
    this.name = "FunctionFailure";
  }
}
