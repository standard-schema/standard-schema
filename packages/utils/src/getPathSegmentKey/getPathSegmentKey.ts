import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Get the key of a path segment.
 *
 * @param pathSegment The path segment to get the key from.
 *
 * @returns The key of the path segment.
 */
export function getPathSegmentKey(
  pathSegment: StandardSchemaV1.PathSegment | PropertyKey,
): PropertyKey {
  return typeof pathSegment === "object" ? pathSegment.key : pathSegment;
}
