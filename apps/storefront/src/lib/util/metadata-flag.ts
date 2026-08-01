/**
 * Reads a boolean-ish flag out of a category/collection's `metadata`.
 * Admin's generic metadata editor stores everything as text key/value pairs,
 * so a flag typed in as "true" needs to be treated the same as an actual
 * boolean `true` (e.g. set programmatically via the API/a script).
 */
export function isMetadataFlagSet(
  metadata: Record<string, unknown> | null | undefined,
  key: string
): boolean {
  const value = metadata?.[key]
  return value === true || value === "true"
}
