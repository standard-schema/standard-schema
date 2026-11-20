import type { StandardSchemaV1 } from "@standard-schema/spec";
import { getPathSegmentKey } from "../getPathSegmentKey/getPathSegmentKey.ts";

/**
 * Creates and returns the dot path of an issue if possible.
 *
 * @param issue The issue to get the dot path from.
 *
 * @returns The dot path or null.
 */
export function getDotPath(issue: StandardSchemaV1.Issue): string | null {
  if (issue.path?.length) {
    let dotPath = "";
    for (const item of issue.path) {
      const key = getPathSegmentKey(item);
      if (typeof key === "string" || typeof key === "number") {
        if (dotPath) {
          dotPath += `.${key}`;
        } else {
          dotPath += key;
        }
      } else {
        return null;
      }
    }
    return dotPath;
  }
  return null;
}
