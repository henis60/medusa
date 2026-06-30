"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  transparent?: boolean
  hideOnTop?: boolean
}

export default function AppointmentButton({ transparent, hideOnTop }: Props) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!hideOnTop) return
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [hideOnTop])

  if (pathname?.includes("/programare")) return null

  const visible = !hideOnTop || scrolled

  return (
    <motion.div
      className="fixed right-0 z-40 bottom-[160px] translate-y-0 small:bottom-auto small:top-[72%] small:-translate-y-1/2"
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 12 }}
      whileHover={{ x: -5 }}
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <LocalizedClientLink
        href="/programare"
        className={`flex transition-colors ${
          transparent
            ? "bg-transparent border-y border-l border-white/20 text-white/60 hover:text-white hover:border-white/40"
            : "bg-[var(--theme-bg)] border-y border-l border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-hunter-gold hover:border-hunter-gold"
        }`}
        aria-label="Programare"
      >
        <span className="appt-ping absolute inset-0 pointer-events-none" aria-hidden="true" />

        {/* Mobile: icon */}
        <span className="flex small:hidden items-center justify-center w-9 h-9">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </span>

        {/* Desktop: text vertical */}
        <span className="hidden small:flex items-center justify-center font-sans text-[9px] uppercase tracking-[4px] py-5 px-2.5 [writing-mode:vertical-rl] rotate-180">
          Programare
        </span>
      </LocalizedClientLink>
    </motion.div>
  )
}
