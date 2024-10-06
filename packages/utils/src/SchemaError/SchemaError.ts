import type { v1 } from "@standard-schema/spec";

/**
 * A schema error with useful information.
 */
export class SchemaError extends Error {
  /**
   * The schema issues.
   */
  public readonly issues: ReadonlyArray<v1.StandardIssue>;

  /**
   * Creates a schema error with useful information.
   *
   * @param issues The schema issues.
   */
  constructor(issues: ReadonlyArray<v1.StandardIssue>) {
    super(issues[0].message);
    this.name = "SchemaError";
    this.issues = issues;
  }
}
