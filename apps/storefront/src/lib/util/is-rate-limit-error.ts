/**
 * sdk.auth.* (login/register/resetPassword/updateProvider) throws the SDK's
 * FetchError on a non-ok response, which carries the HTTP status directly —
 * unlike raw `fetch()` call sites elsewhere, there's no Response to check.
 */
export function isRateLimitError(error: unknown): boolean {
  return (error as { status?: number })?.status === 429
}
