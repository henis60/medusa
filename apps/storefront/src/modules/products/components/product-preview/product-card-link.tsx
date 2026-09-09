"use client"

import { Link, useRouter } from "@i18n/navigation"
import { useRef, useCallback, useEffect } from "react"

type Props = {
  href: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

// Shared across every ProductCardLink instance — one scroll listener total,
// not one per card. Cards currently on screen register a prefetch callback
// here; once scrolling stops for IDLE_MS, whatever's still registered (i.e.
// still visible) gets prefetched. A card that scrolls back out unregisters,
// so a fast scroll-through never prefetches anything — only what the visitor
// is actually looking at once they pause.
const visibleCards = new Map<string, () => void>()
let idleTimer: ReturnType<typeof setTimeout> | null = null
let scrollListenerAttached = false
const IDLE_MS = 250

function flushIdlePrefetch() {
  visibleCards.forEach((prefetch) => prefetch())
}

function scheduleIdlePrefetch() {
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(flushIdlePrefetch, IDLE_MS)
}

function ensureScrollListener() {
  if (scrollListenerAttached || typeof window === "undefined") return
  scrollListenerAttached = true
  window.addEventListener("scroll", scheduleIdlePrefetch, { passive: true })
}

export default function ProductCardLink({
  href,
  className,
  style,
  children,
}: Props) {
  const router = useRouter()
  const fullHref = href
  const linkRef = useRef<HTMLAnchorElement>(null)
  const prefetchedRef = useRef(false)

  useEffect(() => {
    ensureScrollListener()
    const el = linkRef.current
    if (!el) return

    const doPrefetch = () => {
      if (prefetchedRef.current) return
      prefetchedRef.current = true
      router.prefetch(fullHref)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          visibleCards.set(fullHref, doPrefetch)
          // Covers the non-scrolling case too (page loaded already at rest,
          // or a card becomes visible without a scroll event, e.g. a filter
          // change) — schedules the same idle check immediately.
          scheduleIdlePrefetch()
        } else {
          visibleCards.delete(fullHref)
        }
      },
      { rootMargin: "200px 0px" }
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      visibleCards.delete(fullHref)
    }
  }, [fullHref, router])

  const touchStartY = useRef<number>(0)
  const touchStartX = useRef<number>(0)
  const didNavigate = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    didNavigate.current = false
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      // Skip navigation if an overlay was just closed (backdrop ghost-click guard)
      const w = window as typeof window & { __overlayClosedAt?: number }
      if (w.__overlayClosedAt && Date.now() - w.__overlayClosedAt < 600) return

      const dx = Math.abs(e.changedTouches[0].clientX - touchStartX.current)
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
      // Skip if the tap was on an interactive element (button, input, etc.)
      const target = e.target as HTMLElement
      if (target.closest("button, input, select, textarea, [role='button']"))
        return
      // Only treat as a tap if there was no significant scroll movement
      if (dx < 10 && dy < 10) {
        didNavigate.current = true
        router.push(fullHref)
        e.preventDefault()
      }
    },
    [router, fullHref]
  )

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Prevent the click event that fires after touchend on iOS Safari
    if (didNavigate.current) {
      e.preventDefault()
      didNavigate.current = false
    }
  }, [])

  return (
    <Link
      ref={linkRef}
      href={fullHref}
      className={className}
      style={style}
      // Next's default eager-prefetches every Link the instant it enters the
      // viewport — on a product grid with dozens mounted at once (more via
      // infinite scroll), scrolling alone fires a background RSC fetch per
      // card, which both wastes bandwidth and helps trip Cloudflare's per-IP
      // rate limit for a real visitor. Prefetching is handled manually above
      // instead, once scrolling actually pauses on a card.
      prefetch={false}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}
