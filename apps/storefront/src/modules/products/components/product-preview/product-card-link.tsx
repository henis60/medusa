"use client"

import { useRouter, useParams } from "next/navigation"
import { useRef, useCallback } from "react"

type Props = {
  href: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export default function ProductCardLink({
  href,
  className,
  style,
  children,
}: Props) {
  const router = useRouter()
  const { countryCode } = useParams()
  const fullHref = `/${countryCode}${href}`

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
    <a
      href={fullHref}
      className={className}
      style={style}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}
