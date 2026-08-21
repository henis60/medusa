"use client"

import { useEffect } from "react"

// The browser jumps instantly to a URL hash's target on initial page load —
// scroll-behavior:smooth only governs scrolls triggered after the page is
// already interactive, not that first positioning. This re-does the scroll
// smoothly on mount, then strips the hash so a refresh lands at the top
// instead of re-jumping to the same section every time.
//
// Also marks <body> as always-dark for this page (see body.thm-active in
// globals.css) — otherwise iOS Safari's overscroll bounce past the top/
// bottom edge reveals the plain <body> background, which follows the
// site's light/dark theme toggle and defaults to white.
export default function HashScrollFix() {
  useEffect(() => {
    document.body.classList.add("thm-active")
    return () => document.body.classList.remove("thm-active")
  }, [])

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
