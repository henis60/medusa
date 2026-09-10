"use client"

import { useEffect, useState } from "react"

import { montigny } from "./fonts"

export default function SiteHeader({
  homeHref = "/",
  showMeridianSuffix = false,
  ctaHref,
  ctaLabel,
}: {
  homeHref?: string
  showMeridianSuffix?: boolean
  ctaHref?: string
  ctaLabel?: string
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 64,
        padding: "0 var(--pad)",
        background: scrolled ? "rgba(11,18,14,0.55)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(8px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(201,168,76,0.14)"
          : "1px solid transparent",
        transition:
          "background .3s, backdrop-filter .3s, border-color .3s",
      }}
    >
      <div
        style={{
          maxWidth: 1360,
          margin: "0 auto",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href={homeHref}
          className="site-header-logo"
          style={{
            fontFamily: "var(--pd)",
            fontSize: 20,
            lineHeight: 1,
            letterSpacing: "0.12em",
            color: "var(--ivory)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            opacity: scrolled ? 1 : 0,
            transform: scrolled ? "translateY(0)" : "translateY(-6px)",
            pointerEvents: scrolled ? "auto" : "none",
            transition: "opacity .3s, transform .3s",
          }}
        >
          <span style={{ textTransform: "uppercase" }}>The Hunter</span>
          {showMeridianSuffix ? (
            <em
              className={montigny.className}
              style={{
                fontStyle: "normal",
                fontWeight: 500,
                textTransform: "none",
                color: "var(--gold)",
                fontSize: 24,
                marginTop: 5,
              }}
            >
              Meridian
            </em>
          ) : null}
        </a>
        {ctaHref && ctaLabel ? (
          <a
            href={ctaHref}
            target={ctaHref.startsWith("http") ? "_blank" : undefined}
            rel={ctaHref.startsWith("http") ? "noopener" : undefined}
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 36,
              padding: "0 20px",
              border: "1px solid rgba(201,168,76,0.45)",
              fontFamily: "var(--rl)",
              fontSize: 9,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(232,213,163,0.85)",
              textDecoration: "none",
              transition: "border-color .3s, background .3s, color .3s",
            }}
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </header>
  )
}
