import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Creates and returns the JSON Pointer ([RFC 6901](https://www.rfc-editor.org/rfc/rfc6901)) of an issue if possible.
 *
 * Unlike a dot path, a JSON Pointer is unambiguous: `~` is escaped as `~0` and `/` as `~1`, so a key containing a `.` or a `/` stays a single reference token. A missing or empty path points to the whole value (`""`).
 *
 * @param issue The issue to get the JSON Pointer from.
 *
 * @returns The JSON Pointer or `null`.
 */
export const getJsonPointer = (
  issue: StandardSchemaV1.Issue,
): string | null => {
  const keys = (issue.path ?? []).map((item) =>
    typeof item === "object" ? item.key : item,
  );

  // A symbol, or a key that is not a property key at all, has no representation in a JSON Pointer.
  if (keys.some((key) => typeof key !== "string" && typeof key !== "number")) {
    return null;
  }

  // `~` has to be escaped before `/`, so the `~` of an escaped `/` isn't escaped again (RFC 6901, section 3).
  return keys
    .map((key) => `/${String(key).replaceAll("~", "~0").replaceAll("/", "~1")}`)
    .join("");
};
