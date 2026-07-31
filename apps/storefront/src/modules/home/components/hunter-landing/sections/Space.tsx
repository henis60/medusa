"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"

export default function Space() {
  const t = useTranslations("home")

  const ZONES = [
    {
      id: "z1",
      glyph: "S",
      name: t("Salon"),
      tag: t("Zona principală"),
      titleMain: t("Salon") as string,
      titleEm: t("Principal"),
      titleSuffix: "" as string,
      desc: t("Pian cu coadă în centru Canapele din piele cognac Panouri tartan Royal Stewart Candelabre de alamă Covor persan"),
    },
    {
      id: "z2",
      glyph: "B",
      name: t("Bar"),
      tag: t("The Hunter Bar"),
      titleMain: "" as string,
      titleEm: t("Sanctuarul"),
      titleSuffix: t("gustului") as string,
      desc: t("80+ referințe de vin 6 cocktailuri signature Whisky, gin și spirtoase alese personal Blat dark walnut"),
    },
    {
      id: "z3",
      glyph: "A",
      name: t("Atelier"),
      tag: t("Made to Measure"),
      titleMain: t("Atelier") as string,
      titleEm: t("privat"),
      titleSuffix: "" as string,
      desc: t("200+ eșantioane de țesături Super 100–180 Consultație individuală Costumul tău în 21 de zile"),
    },
    {
      id: "z4",
      glyph: "F",
      name: t("Fitting"),
      tag: t("Fitting Room"),
      titleMain: t("Oglinda") as string,
      titleEm: t("adevărului"),
      titleSuffix: "" as string,
      desc: t("Oglindă triplu-panou Iluminat calibrat Intimitate totală Ajustări finale pe loc"),
    },
    {
      id: "z5",
      glyph: "L",
      name: t("Lounge"),
      tag: t("Membership Gold · Black"),
      titleMain: t("Privat") as string,
      titleEm: t("Lounge"),
      titleSuffix: "" as string,
      desc: t("Rezervat exclusiv membrilor Întâlniri private, degustări exclusive și momente care nu se publică"),
    },
  ]

  const sectionRef = useRef<HTMLElement>(null)
  const zonesRef = useRef<HTMLDivElement>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const tapRef = useRef<{ x: number; y: number } | null>(null)

  // Recompute which zone is most visible in the scroll container
  const updateActive = useCallback(() => {
    const el = zonesRef.current
    if (!el) return
    if (window.innerWidth > 768) {
      setActiveId(null)
      return
    }
    const zoneEls = Array.from(el.querySelectorAll<HTMLElement>(".zone"))
    if (!zoneEls.length) return
    const cw = el.offsetWidth
    const sl = el.scrollLeft
    const zw = zoneEls[0].offsetWidth
    let best = zoneEls[0]
    let bestRatio = -1
    zoneEls.forEach((z, i) => {
      const zStart = i * zw
      const vis = Math.max(0, Math.min(zStart + zw, sl + cw) - Math.max(zStart, sl))
      if (vis / zw > bestRatio) { bestRatio = vis / zw; best = z }
    })
    setActiveId(best.dataset.zoneId ?? null)
  }, [])

  // Only window resize needs an imperative listener — everything else is JSX
  useEffect(() => {
    updateActive()
    window.addEventListener("resize", updateActive, { passive: true })
    return () => window.removeEventListener("resize", updateActive)
  }, [updateActive])

  // Scroll-jacking on mobile: while the section is docked at the top of the
  // viewport and the carousel hasn't been fully swiped through yet, a
  // vertical swipe drives the carousel's horizontal scroll instead of the
  // page — so swiping down "drains" sideways through every zone first,
  // then releases back to normal page scroll once it reaches the end (and
  // symmetrically in reverse on the way back up). This makes the section
  // unmistakably a carousel instead of a single static panel.
  useEffect(() => {
    const el = zonesRef.current
    const section = sectionRef.current
    if (!el || !section || window.innerWidth > 768) return

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (prefersReducedMotion) return

    let lastY = 0
    // Decided once per gesture (at touchstart), not re-evaluated mid-swipe:
    // iOS Safari commits a touch sequence to native scrolling on its first
    // unprevented touchmove, so switching a gesture from "page scroll" to
    // "carousel drag" partway through wouldn't reliably cancel it anyway.
    let capturing = false

    const maxScroll = () => el.scrollWidth - el.clientWidth

    function onTouchStart(e: TouchEvent) {
      lastY = e.touches[0].clientY
      const rect = section!.getBoundingClientRect()
      capturing = rect.top <= 80 && rect.top > -80
    }

    function onTouchMove(e: TouchEvent) {
      if (!capturing) return
      const currentY = e.touches[0].clientY
      const deltaY = lastY - currentY // positive = swiping up = scroll-down intent
      const atStart = el.scrollLeft <= 0
      const atEnd = el.scrollLeft >= maxScroll() - 1

      if ((deltaY > 0 && atEnd) || (deltaY < 0 && atStart)) {
        // Carousel has nothing left to give in this direction — stop
        // capturing so the rest of this gesture scrolls the page normally.
        capturing = false
        return
      }

      e.preventDefault()
      el.scrollLeft += deltaY
      lastY = currentY
    }

    function onTouchEnd() {
      capturing = false
    }

    section.addEventListener("touchstart", onTouchStart, { passive: true })
    section.addEventListener("touchmove", onTouchMove, { passive: false })
    section.addEventListener("touchend", onTouchEnd, { passive: true })
    return () => {
      section.removeEventListener("touchstart", onTouchStart)
      section.removeEventListener("touchmove", onTouchMove)
      section.removeEventListener("touchend", onTouchEnd)
    }
  }, [])

  function handlePointerDown(e: React.PointerEvent) {
    tapRef.current = { x: e.clientX, y: e.clientY }
  }

  function handleClick(e: React.MouseEvent) {
    if (window.innerWidth > 768) return
    const start = tapRef.current
    if (!start) return
    if (Math.abs(e.clientX - start.x) > 10 || Math.abs(e.clientY - start.y) > 10) return
    if ((e.target as HTMLElement).closest(".zone.is-active")) return
    const el = zonesRef.current
    if (!el) return
    const zw = el.querySelectorAll<HTMLElement>(".zone")[0]?.offsetWidth ?? 0
    const next = (Math.round(el.scrollLeft / zw) + 1) % ZONES.length
    el.scrollTo({ left: next * zw, behavior: "smooth" })
  }

  return (
    <section className="space-sec" id="space" ref={sectionRef}>
      <div
        ref={zonesRef}
        className="zones rv"
        data-rv-delay="0.12"
        onScroll={updateActive}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        {ZONES.map((zone) => (
          <div
            key={zone.id}
            data-zone-id={zone.id}
            className={`zone ${zone.id}${activeId === zone.id ? " is-active" : ""}`}
            onMouseEnter={() => document.body.classList.add("hovering")}
            onMouseLeave={() => document.body.classList.remove("hovering")}
          >
            <div className="zone-bg"></div>
            <div className="zone-tex"></div>
            <div className="zone-grad"></div>
            <div className="zone-glyph">{zone.glyph}</div>
            <div className="zone-collapsed">
              <span className="zone-vname">{zone.name}</span>
            </div>
            <div className="zone-expanded">
              <div className="zone-tag">{zone.tag}</div>
              <div className="zone-title">
                {zone.id === "z2" && <em>{zone.titleEm}</em>}
                {zone.id !== "z2" && (
                  <>
                    {zone.titleMain}{" "}
                    <em>{zone.titleEm}</em>
                  </>
                )}
                {zone.id === "z2" && <> {zone.titleSuffix}</>}
              </div>
              <p className="zone-desc">{zone.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
