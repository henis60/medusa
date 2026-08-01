"use client"

import { useEffect } from "react"
import {
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
    const handleError = (event: ErrorEvent) => {
      if (isStaleDeploymentError(event.error ?? event.message)) {
        reloadForNewDeployment()
      }
    }
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (isStaleDeploymentError(event.reason)) {
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
