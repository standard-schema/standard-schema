import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { SchemaArgs } from "../_removeSchemaArg/_removeSchemaArg.ts";
import { _removeSchemaArg } from "../_removeSchemaArg/_removeSchemaArg.ts";
import type { IssueMapper } from "../flattenIssues/flattenIssues.ts";
import { getPathSegmentKey } from "../getPathSegmentKey/getPathSegmentKey.ts";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type RecursiveFormattedIssues<T, MappedIssue> = T extends [any, ...any[]]
  ? { [K in keyof T]?: FormattedIssues<T[K], MappedIssue> }
  : // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    T extends any[]
    ? { [k: number]: FormattedIssues<T[number], MappedIssue> }
    : T extends object
      ? { [K in keyof T]?: FormattedIssues<T[K], MappedIssue> }
      : unknown;

export type InferFormattedIssues<
  Schema extends StandardSchemaV1,
  MappedIssue = string,
> = FormattedIssues<StandardSchemaV1.InferOutput<Schema>, MappedIssue>;
export type FormattedIssues<T, MappedIssue = string> = {
  _issues: MappedIssue[];
} & RecursiveFormattedIssues<NonNullable<T>, MappedIssue>;

/**
 * Formats a set of issues into a nested object.
 *
 * @param issues The issues to format.
 */
export function formatIssues(
  issues: readonly StandardSchemaV1.Issue[],
): FormattedIssues<unknown>;
/**
 * Formats a set of issues into a nested object.
 *
 * @param issues The issues to format.
 *
 * @param mapIssue A function that maps an issue to a value.
 */
export function formatIssues<MappedIssue>(
  issues: readonly StandardSchemaV1.Issue[],
  mapIssue: IssueMapper<MappedIssue>,
): FormattedIssues<unknown, MappedIssue>;
/**
 * Formats a set of issues into a nested object.
 *
 * @param schema The schema the issues came from (for inferring the shape of the field errors).
 *
 * @param issues The issues to format.
 */
export function formatIssues<Schema extends StandardSchemaV1>(
  schema: Schema,
  issues: readonly StandardSchemaV1.Issue[],
): InferFormattedIssues<Schema>;
/**
 * Formats a set of issues into a nested object.
 *
 * @param schema The schema the issues came from (for inferring the shape of the field errors).
 *
 * @param issues The issues to format.
 *
 * @param mapIssue A function that maps an issue to a value.
 */
export function formatIssues<Schema extends StandardSchemaV1, MappedIssue>(
  schema: Schema,
  issues: readonly StandardSchemaV1.Issue[],
  mapIssue: IssueMapper<MappedIssue>,
): InferFormattedIssues<Schema, MappedIssue>;
export function formatIssues(
  ...args: SchemaArgs<
    [issues: readonly StandardSchemaV1.Issue[], mapIssue?: IssueMapper<unknown>]
  >
): FormattedIssues<unknown, unknown> {
  const [issues, mapIssue = (issue: StandardSchemaV1.Issue) => issue.message] =
    _removeSchemaArg(args);
  const fieldErrors: FormattedIssues<unknown, unknown> = {
    _issues: [],
  };
  for (const issue of issues) {
    if (!issue.path?.length) {
      (fieldErrors._issues as unknown[]).push(mapIssue(issue));
      continue;
    }
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let cursor: any = fieldErrors;
    for (const segment of issue.path) {
      const key = getPathSegmentKey(segment);
      cursor[key] ??= { _issues: [] };
      cursor = cursor[key];
    }
    cursor._issues.push(mapIssue(issue));
  }
  return fieldErrors;
}
