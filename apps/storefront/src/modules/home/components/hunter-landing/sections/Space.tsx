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
  // The swipe hint must only ever play once per page load, but inView's
  // callback re-fires every time the section re-enters the viewport.
  const hasHintedRef = useRef(false)
  const hintTimerRef = useRef<number | null>(null)

  // Recompute which zone is most visible in the scroll container. Desktop
  // doesn't scroll this container horizontally at all (flex layout, no
  // overflow) — activeId there is driven only by the intro reveal below and
  // by CSS :hover, so this bails out without touching it.
  const updateActive = useCallback(() => {
    const el = zonesRef.current
    if (!el) return
    if (window.innerWidth > 768) return
    const zoneEls = Array.from(el.querySelectorAll<HTMLElement>(".zone"))
    if (!zoneEls.length) return
    const cw = el.offsetWidth
    const sl = el.scrollLeft
    let best = zoneEls[0]
    let bestRatio = -1
    zoneEls.forEach((z) => {
      const zStart = z.offsetLeft
      const zw = z.offsetWidth
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

  // All zones start collapsed either way. The first time the section
  // scrolls into view, reveal the first one (Salon) — on desktop this
  // drives the same .is-active CSS that :hover otherwise controls, so the
  // opening zone expands automatically before the visitor has done
  // anything; on mobile it's the same class the swipe/tap logic below
  // already drives. Interaction (hover on desktop, swipe/tap on mobile)
  // takes over normally from there — no scroll-jacking, no auto-advance.
  //
  // The mobile peek strips get an entrance animation using the same
  // framer-motion animate()+inView() primitives the rest of the site's
  // scroll-reveal system already uses (see hunter-landing/index.tsx) —
  // proven to work reliably, instead of a bespoke CSS-animation/
  // IntersectionObserver combination. Inline opacity/transform are cleared
  // once the animation finishes so is-active/:hover CSS keeps controlling
  // the element afterward (framer's WAAPI wrapper commits the final
  // keyframe as a real inline style on finish, which would otherwise
  // permanently outrank those class-based rules).
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    let cancelled = false
    let stopInView: (() => void) | undefined

    import("framer-motion").then(({ inView, animate }) => {
      if (cancelled) return
      stopInView = inView(
        section,
        () => {
          setActiveId(ZONES[0].id)
          if (window.innerWidth <= 768) {
            const labels = Array.from(
              section.querySelectorAll<HTMLElement>(".zone-collapsed")
            )
            labels.forEach((el, i) => {
              el.style.opacity = "0"
              el.style.transform = "translateX(14px)"
              const controls = animate(
                el,
                {
                  opacity: [0, 1],
                  transform: ["translateX(14px)", "translateX(0)"],
                },
                { duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.05 + i * 0.1 }
              )
              controls.finished.then(() => {
                el.style.opacity = ""
                el.style.transform = ""
              })
            })

            // Swipe affordance: the peek strips alone don't tell anyone the
            // row scrolls, so nudge it a little to the right and let it
            // settle back — the standard "there's more over here" cue. Runs
            // after the label stagger above (~0.95s) so the two don't
            // overlap and read as one confused motion.
            hintSwipe(animate)
          }
        },
        { amount: 0.4 }
      )
    })

    return () => {
      cancelled = true
      stopInView?.()
      if (hintTimerRef.current !== null) {
        window.clearTimeout(hintTimerRef.current)
      }
    }
  }, [])

  // Nudges the zones row right and back to advertise that it swipes.
  //
  // Animates scrollLeft rather than a transform: a transform would slide the
  // whole row (peek strips included) without the container's scroll position
  // actually changing, so it wouldn't reveal that there's more content to
  // reach — which is the entire point of the cue.
  //
  // scroll-snap-type is mandatory on this container (see globals.css), and
  // mandatory snapping fights any partial programmatic scroll — it yanks the
  // position back to the nearest snap point mid-animation. It's switched off
  // for the duration and restored afterwards.
  const hintSwipe = useCallback(
    (animate: typeof import("framer-motion").animate) => {
      const el = zonesRef.current
      if (!el || hasHintedRef.current) return
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      hasHintedRef.current = true

      const timer = window.setTimeout(() => {
        // Someone already started scrolling — they've clearly found it, so
        // hinting now would just fight them for control of the container.
        if (el.scrollLeft > 2) return

        const maxScroll = el.scrollWidth - el.clientWidth
        if (maxScroll <= 8) return
        const distance = Math.min(52, maxScroll)

        const prevSnapType = el.style.scrollSnapType
        el.style.scrollSnapType = "none"

        const restore = () => {
          el.style.scrollSnapType = prevSnapType
          el.removeEventListener("pointerdown", cancel)
          el.removeEventListener("touchstart", cancel)
        }

        const controls = animate(0, 1, {
          duration: 1.15,
          ease: "easeInOut",
          // Half a sine wave: 0 → distance → 0, so it drifts out and eases
          // back to exactly where it started with no snap-back jolt.
          onUpdate: (progress: number) => {
            el.scrollLeft = Math.sin(progress * Math.PI) * distance
          },
          onComplete: () => {
            el.scrollLeft = 0
            restore()
          },
        })

        // Hand control straight back the instant the visitor touches it.
        function cancel() {
          controls.stop()
          restore()
        }
        el.addEventListener("pointerdown", cancel, { once: true })
        el.addEventListener("touchstart", cancel, { once: true, passive: true })
      }, 950)

      hintTimerRef.current = timer
    },
    []
  )

  function handlePointerDown(e: React.PointerEvent) {
    tapRef.current = { x: e.clientX, y: e.clientY }
  }

  // On desktop, Salon opens via the intro reveal (see effect above) using the
  // same .is-active class :hover otherwise drives. Once the visitor hovers
  // any zone for the first time, hand control back to CSS :hover entirely —
  // otherwise .is-active never clears and Salon stays expanded forever
  // alongside whichever zone is actually hovered.
  function handleZonesMouseOver() {
    if (window.innerWidth <= 768) return
    setActiveId(null)
  }

  function handleClick(e: React.MouseEvent) {
    if (window.innerWidth > 768) return
    const start = tapRef.current
    if (!start) return
    if (Math.abs(e.clientX - start.x) > 10 || Math.abs(e.clientY - start.y) > 10) return
    if ((e.target as HTMLElement).closest(".zone.is-active")) return
    const el = zonesRef.current
    if (!el) return
    const zoneEls = Array.from(el.querySelectorAll<HTMLElement>(".zone"))
    const activeIndex = zoneEls.findIndex((z) => z.dataset.zoneId === activeId)
    const nextZone = zoneEls[(Math.max(activeIndex, 0) + 1) % zoneEls.length]
    el.scrollTo({ left: nextZone.offsetLeft, behavior: "smooth" })
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
        onMouseOver={handleZonesMouseOver}
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
