/**
 * Heuristic for "the Medusa backend is unreachable" vs. a generic app bug —
 * used by error.tsx boundaries to show a distinct "temporarily unavailable"
 * message instead of the generic error screen. Covers both the browser's
 * fetch failure message and Node's connection-refused/DNS error codes (server
 * actions run server-side, where the backend might be down or misconfigured).
 */
export function isConnectionError(error: Error & { digest?: string }): boolean {
  const message = `${error.message ?? ""} ${(error.cause as any)?.code ?? ""}`.toLowerCase()

  return (
    message.includes("fetch failed") ||
    message.includes("econnrefused") ||
    message.includes("enotfound") ||
    message.includes("etimedout") ||
    message.includes("failed to fetch")
  )
}
