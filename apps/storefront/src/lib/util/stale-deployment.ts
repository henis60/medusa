"use client"

/**
 * The cart drawer lives in the persistent layout — it never remounts on
 * navigation, so a tab left open across a deploy keeps calling Server
 * Actions by an id baked into the old JS bundle. The new deployment doesn't
 * recognize that id, so Next.js's client runtime rejects with an error like
 * "Failed to find Server Action ... This request might be from an older or
 * newer deployment." Any component that stays mounted across navigations
 * (drawer, header, persistent widgets) can hit this after a deploy while the
 * /cart *page* doesn't, because navigating there re-fetches the RSC tree
 * (and its current action ids) fresh every time.
 *
 * There's nothing meaningful to recover locally once this happens — every
 * further action call from this tab will fail the same way — so the fix is
 * a full reload to pick up the new deployment's JS.
 */
export function isStaleDeploymentError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? "")
  return (
    /failed to find server action/i.test(message) ||
    /older or newer deployment/i.test(message)
  )
}

export function reloadForNewDeployment() {
  if (typeof window !== "undefined") {
    window.location.reload()
  }
}
