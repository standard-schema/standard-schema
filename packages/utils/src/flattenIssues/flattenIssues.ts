import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { SchemaArgs } from "../_removeSchemaArg/_removeSchemaArg.ts";
import { _removeSchemaArg } from "../_removeSchemaArg/_removeSchemaArg.ts";
import type { KeyofUnion } from "../_types/index.ts";
import { getPathSegmentKey } from "../getPathSegmentKey/getPathSegmentKey.ts";

export type InferFlattenedIssues<
  TSchema extends StandardSchemaV1,
  TMapped = string,
> = FlattenedIssues<StandardSchemaV1.InferOutput<TSchema>, TMapped>;

export interface FlattenedIssues<TFields, TMapped = string> {
  formIssues: readonly TMapped[];
  fieldIssues: Partial<Record<KeyofUnion<TFields>, readonly TMapped[]>>;
}

export type IssueMapper<TMapped> = (issue: StandardSchemaV1.Issue) => TMapped;

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
export function flattenIssues<TMapped>(
  issues: readonly StandardSchemaV1.Issue[],
  mapIssue: IssueMapper<TMapped>,
): FlattenedIssues<unknown, TMapped>;
/**
 * Flatten issues into form and field errors. Useful for schemas that are one level deep.
 *
 * @param schema The schema the issues came from (for inferring the shape of the field errors).
 *
 * @param issues The issues to flatten.
 */
export function flattenIssues<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  issues: readonly StandardSchemaV1.Issue[],
): InferFlattenedIssues<TSchema>;
/**
 * Flatten issues into form and field errors. Useful for schemas that are one level deep.
 *
 * @param schema The schema the issues came from (for inferring the shape of the field errors).
 *
 * @param issues The issues to flatten.
 *
 * @param mapIssue A function that maps an issue to a value.
 */
export function flattenIssues<TSchema extends StandardSchemaV1, TMapped>(
  schema: TSchema,
  issues: readonly StandardSchemaV1.Issue[],
  mapIssue: IssueMapper<TMapped>,
): InferFlattenedIssues<TSchema, TMapped>;
export function flattenIssues(
  ...args: SchemaArgs<
    [issues: readonly StandardSchemaV1.Issue[], mapIssue?: IssueMapper<unknown>]
  >
): FlattenedIssues<unknown, unknown> {
  const [issues, mapIssue = (issue: StandardSchemaV1.Issue) => issue.message] =
    _removeSchemaArg(args);
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
