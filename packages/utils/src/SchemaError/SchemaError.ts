import type { StandardSchemaV1 } from "@standard-schema/spec";
import { summarize } from "../summarize/summarize.ts";

/**
 * A schema error with useful information.
 */
export class SchemaError extends Error {
  /**
   * The schema issues.
   */
  public readonly issues: ReadonlyArray<StandardSchemaV1.Issue>;

  /**
   * Creates a schema error with useful information.
   *
   * @param issues The schema issues.
   */
  constructor(issues: ReadonlyArray<StandardSchemaV1.Issue>) {
    super(summarize(issues));
    this.name = "SchemaError";
    this.issues = issues;
  }
}
