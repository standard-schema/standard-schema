import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { SchemaArgs } from "../_removeSchemaArg/_removeSchemaArg.ts";
import { _removeSchemaArg } from "../_removeSchemaArg/_removeSchemaArg.ts";
import type { IssueMapper } from "../flattenIssues/flattenIssues.ts";
import { getPathSegmentKey } from "../getPathSegmentKey/getPathSegmentKey.ts";

type RecursiveFormattedIssues<T, TMapped> = T extends readonly [
  unknown,
  ...unknown[],
]
  ? { [TKey in keyof T]?: FormattedIssues<T[TKey], TMapped> }
  : T extends readonly unknown[]
    ? { [k: number]: FormattedIssues<T[number], TMapped> }
    : T extends object
      ? { [TKey in keyof T]?: FormattedIssues<T[TKey], TMapped> }
      : unknown;

export type InferFormattedIssues<
  TSchema extends StandardSchemaV1,
  TMapped = string,
> = FormattedIssues<StandardSchemaV1.InferOutput<TSchema>, TMapped>;
export type FormattedIssues<T, TMapped = string> = {
  _issues: readonly TMapped[];
} & RecursiveFormattedIssues<NonNullable<T>, TMapped>;

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
export function formatIssues<TMapped>(
  issues: readonly StandardSchemaV1.Issue[],
  mapIssue: IssueMapper<TMapped>,
): FormattedIssues<unknown, TMapped>;
/**
 * Formats a set of issues into a nested object.
 *
 * @param schema The schema the issues came from (for inferring the shape of the field errors).
 *
 * @param issues The issues to format.
 */
export function formatIssues<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  issues: readonly StandardSchemaV1.Issue[],
): InferFormattedIssues<TSchema>;
/**
 * Formats a set of issues into a nested object.
 *
 * @param schema The schema the issues came from (for inferring the shape of the field errors).
 *
 * @param issues The issues to format.
 *
 * @param mapIssue A function that maps an issue to a value.
 */
export function formatIssues<TSchema extends StandardSchemaV1, TMapped>(
  schema: TSchema,
  issues: readonly StandardSchemaV1.Issue[],
  mapIssue: IssueMapper<TMapped>,
): InferFormattedIssues<TSchema, TMapped>;
export function formatIssues(
  ...args: SchemaArgs<
    [issues: readonly StandardSchemaV1.Issue[], mapIssue?: IssueMapper<unknown>]
  >
): FormattedIssues<unknown, unknown> {
  const [issues, mapIssue = (issue: StandardSchemaV1.Issue) => issue.message] =
    _removeSchemaArg(args);
  const fieldIssues: FormattedIssues<unknown, unknown> = {
    _issues: [],
  };
  for (const issue of issues) {
    if (!issue.path?.length) {
      (fieldIssues._issues as unknown[]).push(mapIssue(issue));
      continue;
    }
    // biome-ignore lint/suspicious/noExplicitAny: recursive structures are hard to type
    let cursor: any = fieldIssues;
    for (const segment of issue.path) {
      const key = getPathSegmentKey(segment);
      cursor[key] ??= { _issues: [] };
      cursor = cursor[key];
    }
    cursor._issues.push(mapIssue(issue));
  }
  return fieldIssues;
}
