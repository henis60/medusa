"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const ZONES = [
  {
    id: "z1",
    glyph: "S",
    name: "Salon",
    tag: "Zona principală",
    title: "Salon Principal",
    highlighted: "Principal",
    desc: "Pian cu coadă în centru. Canapele din piele cognac. Panouri tartan Royal Stewart. Candelabre de alamă. Covor persan.",
  },
  {
    id: "z2",
    glyph: "B",
    name: "Bar",
    tag: "The Hunter Bar",
    title: "Sanctuarul gustului",
    highlighted: "Sanctuarul",
    desc: "80+ referințe de vin. 6 cocktailuri signature. Whisky, gin și spirtoase alese personal. Blat dark walnut.",
  },
  {
    id: "z3",
    glyph: "A",
    name: "Atelier",
    tag: "Made to Measure",
    title: "Atelier privat",
    highlighted: "privat",
    desc: "200+ eșantioane de țesături Super 100–180. Consultație individuală. Costumul tău în 21 de zile.",
  },
  {
    id: "z4",
    glyph: "F",
    name: "Fitting",
    tag: "Fitting Room",
    title: "Oglinda adevărului",
    highlighted: "adevărului",
    desc: "Oglindă triplu-panou. Iluminat calibrat. Intimitate totală. Ajustări finale pe loc.",
  },
  {
    id: "z5",
    glyph: "L",
    name: "Lounge",
    tag: "Membership Gold · Black",
    title: "Lounge Privat",
    highlighted: "Privat",
    desc: "Rezervat exclusiv membrilor. Întâlniri private, degustări exclusive și momente care nu se publică.",
  },
]

export default function Space() {
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
    <section className="space-sec" id="space">
      <div
        ref={zonesRef}
        className="zones rv"
        style={{ transitionDelay: "0.12s" }}
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
                {zone.id === "z2" && <em>{zone.highlighted}</em>}
                {zone.id !== "z2" && (
                  <>
                    {zone.title.replace(zone.highlighted, "")}{" "}
                    <em>{zone.highlighted}</em>
                  </>
                )}
                {zone.id === "z2" && <> gustului</>}
              </div>
              <p className="zone-desc">{zone.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
