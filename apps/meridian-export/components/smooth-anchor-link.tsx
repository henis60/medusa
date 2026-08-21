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

        window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" })
      }}
    >
      {children}
    </a>
  )
}
