"use client"

import { useEffect } from "react"

/**
 * Locks page scroll while `open` is true — used by modals/drawers so the
 * background page can't scroll behind them. Compensates for the vanishing
 * scrollbar with padding-right so the layout doesn't shift/jump.
 */
export function useScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = document.documentElement.style.overflow
    const prevPaddingRight = document.documentElement.style.paddingRight

    document.documentElement.style.overflow = "hidden"
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      document.documentElement.style.overflow = prevOverflow
      document.documentElement.style.paddingRight = prevPaddingRight
    }
  }, [open])
}
