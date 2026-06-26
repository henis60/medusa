"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const NavShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const isLanding = (pathname?.split("/").filter(Boolean).length ?? 0) === 0

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="sticky top-0 inset-x-0 z-[9001] group">
      <header
        className={
          "relative h-16 mx-auto transition-all duration-300 border-b " +
          (isLanding
            ? scrolled
              ? "bg-black/30 backdrop-blur-md border-white/10 text-white"
              : "bg-transparent border-transparent text-white nav-at-hero"
            : "bg-[var(--theme-chrome)] border-[var(--theme-border)] dark:border-hunter-gold/20 text-[var(--theme-text)]")
        }
      >
        <nav className="content-container flex items-center justify-between w-full h-full font-sans text-[11px] uppercase tracking-[3px]">
          {children}
        </nav>
      </header>
    </div>
  )
}

export default NavShell
