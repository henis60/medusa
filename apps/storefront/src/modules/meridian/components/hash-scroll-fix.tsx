"use client"

import { useEffect } from "react"

// The browser jumps instantly to a URL hash's target on initial page load —
// scroll-behavior:smooth only governs scrolls triggered after the page is
// already interactive, not that first positioning. This re-does the scroll
// smoothly on mount, then strips the hash so a refresh lands at the top
// instead of re-jumping to the same section every time.
export default function HashScrollFix() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    const target = document.querySelector(hash)
    if (!target) return

    target.scrollIntoView({ behavior: "smooth", block: "start" })

    const clean = window.location.pathname + window.location.search
    window.history.replaceState(null, "", clean)
  }, [])

  return null
}
