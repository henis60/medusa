"use client"

import { useEffect } from "react"
import {
  clearStaleDeployReloadGuard,
  isStaleDeploymentError,
  reloadForNewDeployment,
} from "@lib/util/stale-deployment"

/**
 * Catches "chunk failed to load" errors app-wide, not just the specific
 * "Failed to find Server Action" case already handled where cart mutations
 * are called. A tab left open across a deploy has old, content-hashed chunk
 * URLs baked into its JS — any dynamic import() (route transition, lazy
 * component) that isn't already cached in the browser 404s once the old
 * build's files are gone from the server/CDN. There's nothing to recover
 * locally once that happens, so the fix is the same hard reload used for
 * the server-action case.
 *
 * Chunk load failures surface two different ways depending on how the
 * import was triggered, so both listeners are needed:
 *  - a synchronous <script> tag failing to load throws via `error` on window
 *  - a failed dynamic import() rejects its promise instead, surfacing only
 *    via `unhandledrejection`
 */
export default function ChunkErrorGuard() {
  useEffect(() => {
    // This mount proves the JS currently running loaded successfully — any
    // stale-deployment error from here on is a new, genuine incident (e.g. a
    // second deploy landing while this tab stayed open) and deserves its
    // own reload, not silence because an earlier, unrelated incident in
    // this same tab already used up the one-time guard.
    clearStaleDeployReloadGuard()

    const handleError = (event: ErrorEvent) => {
      if (isStaleDeploymentError(event.error ?? event.message)) {
        // Otherwise the browser still prints the raw error to the console
        // right as we're already reloading to fix it — confusing, since it
        // looks like the guard failed when it's actually working.
        event.preventDefault()
        reloadForNewDeployment()
      }
    }
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (isStaleDeploymentError(event.reason)) {
        event.preventDefault()
        reloadForNewDeployment()
      }
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleRejection)
    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  return null
}
