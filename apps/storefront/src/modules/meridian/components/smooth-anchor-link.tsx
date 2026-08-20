"use client"

// Safari's support for CSS `scroll-behavior: smooth` on in-page hash
// navigation is inconsistent (older/older-iOS Safari ignores it entirely,
// jumping instantly), so this handles the scroll itself via
// `scrollIntoView`, which Safari does animate smoothly.
export default function SmoothAnchorLink({
  href,
  className,
  style,
  children,
}: {
  href: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  const smoothScrollTo = (targetY: number, duration = 700) => {
    const startY = window.scrollY
    const delta = targetY - startY
    if (Math.abs(delta) < 1) return

    const start = performance.now()
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = easeInOutCubic(p)
      window.scrollTo(0, startY + delta * eased)
      if (p < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }

  return (
    <a
      href={href}
      className={className}
      style={style}
      onClick={(e) => {
        if (!href.startsWith("#")) return
        const target = document.querySelector(href)
        if (!target) return
        e.preventDefault()

        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
        const navOffset = 72
        const targetY =
          target.getBoundingClientRect().top + window.scrollY - navOffset

        if (prefersReducedMotion) {
          window.scrollTo(0, Math.max(0, targetY))
          return
        }

        // Native smooth can fail on some mobile browsers with hash navigation,
        // so drive scrolling ourselves for consistent behavior.
        smoothScrollTo(Math.max(0, targetY), 700)
      }}
    >
      {children}
    </a>
  )
}
