import type { StandardSchemaV1 } from "@standard-schema/spec";
import { getPathSegmentKey } from "../getPathSegmentKey/getPathSegmentKey.ts";

type KeyofUnion<T> = T extends unknown ? keyof T : never;

export interface FlattenedIssues<Fields, MappedIssue = string> {
  formIssues: readonly MappedIssue[];
  fieldIssues: Partial<Record<KeyofUnion<Fields>, readonly MappedIssue[]>>;
}

export type IssueMapper<MappedIssue> = (
  issue: StandardSchemaV1.Issue,
) => MappedIssue;

/**
 * Flatten issues into form and field errors. Useful for schemas that are one level deep.
 *
 * @param issues The issues to flatten.
 */
export function flattenIssues(
  issues: readonly StandardSchemaV1.Issue[],
): FlattenedIssues<unknown>;
/**
 * Flatten issues into form and field errors. Useful for schemas that are one level deep.
 *
 * @param issues The issues to flatten.
 *
 * @param mapIssue A function that maps an issue to a value.
 */
export function flattenIssues<MappedIssue>(
  issues: readonly StandardSchemaV1.Issue[],
  mapIssue: IssueMapper<MappedIssue>,
): FlattenedIssues<unknown, MappedIssue>;
/**
 * Flatten issues into form and field errors. Useful for schemas that are one level deep.
 *
 * @param schema The schema to use for inferring the shape of the field errors.
 *
 * @param issues The issues to flatten.
 */
export function flattenIssues<Schema extends StandardSchemaV1>(
  schema: Schema,
  issues: readonly StandardSchemaV1.Issue[],
): FlattenedIssues<StandardSchemaV1.InferOutput<Schema>>;
/**
 * Flatten issues into form and field errors. Useful for schemas that are one level deep.
 *
 * @param schema The schema to use for inferring the shape of the field errors.
 *
 * @param issues The issues to flatten.
 *
 * @param mapIssue A function that maps an issue to a value.
 */
export function flattenIssues<Schema extends StandardSchemaV1, MappedIssue>(
  schema: Schema,
  issues: readonly StandardSchemaV1.Issue[],
  mapIssue: IssueMapper<MappedIssue>,
): FlattenedIssues<StandardSchemaV1.InferOutput<Schema>, MappedIssue>;
export function flattenIssues(
  schemaOrIssues: StandardSchemaV1 | readonly StandardSchemaV1.Issue[],
  issuesOrMapper?: readonly StandardSchemaV1.Issue[] | IssueMapper<unknown>,
  mapIssue: IssueMapper<unknown> = (issue) => issue.message,
): FlattenedIssues<unknown, unknown> {
  if (Array.isArray(schemaOrIssues)) {
    return flattenIssues(
      {} as StandardSchemaV1,
      schemaOrIssues,
      (issuesOrMapper as IssueMapper<unknown>) ?? mapIssue,
    );
  }
  const issues = issuesOrMapper as readonly StandardSchemaV1.Issue[];
  const formIssues: unknown[] = [];
  const fieldIssues: Record<PropertyKey, unknown[]> = {};

  for (const issue of issues) {
    if (issue.path?.length) {
      const key = getPathSegmentKey(issue.path[0]);
      fieldIssues[key] ??= [];
      fieldIssues[key].push(mapIssue(issue));
    } else {
      formIssues.push(mapIssue(issue));
    }
  }

  return {
    formIssues,
    fieldIssues,
  };
}
