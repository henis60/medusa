"use client"

import { useEffect, useState } from "react"

export default function MeridianHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className="thm-header"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        boxSizing: "border-box",
        zIndex: 20,
        alignItems: "center",
        background: "transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(201,168,76,0.18)"
          : "1px solid transparent",
        transition: "backdrop-filter .35s, border-color .35s",
      }}
    >
      <span
        className="thm-header-title"
        style={{
          fontFamily: "var(--pd)",
          textTransform: "uppercase",
          color: "var(--ivory)",
          whiteSpace: "nowrap",
          justifySelf: "start",
        }}
      >
        The Hunter{" "}
        <em
          style={{
            fontStyle: "italic",
            color: "var(--gold)",
            letterSpacing: "0.14em",
          }}
        >
          Meridian
        </em>
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifySelf: "end",
          fontFamily: "var(--rl)",
        }}
      >
        <a
          href="#bilete"
          className="thm-btn-outline thm-header-cta"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: "transparent",
            border: "1px solid rgba(201,168,76,0.45)",
            color: "rgba(232,213,163,0.78)",
            whiteSpace: "nowrap",
            opacity: scrolled ? 1 : 0,
            pointerEvents: scrolled ? "auto" : "none",
            transform: scrolled ? "translateY(0)" : "translateY(-4px)",
            transition:
              "opacity .35s, transform .35s, background .3s, border-color .3s, color .3s",
          }}
        >
          BILETE
        </a>
      </div>
    </div>
  )
}
