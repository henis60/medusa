"use client"

import { m as motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

const SPONSORS = [1, 2, 3, 4, 5, 6]

function SponsorStrip({ hidden, innerRef }: { hidden?: boolean; innerRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={innerRef}
      style={{
        display: "flex",
        gap: "clamp(24px,3vw,44px)",
        alignItems: "center",
        paddingRight: "clamp(24px,3vw,44px)",
      }}
      aria-hidden={hidden ? "true" : undefined}
    >
      {SPONSORS.map((n) => (
        <Image
          key={n}
          src={`/meridian/thm-sponsor-${n}.webp`}
          alt={hidden ? "" : `Logo sponsor ${n}`}
          width={72}
          height={26}
          style={{
            flex: "0 0 auto",
            width: 72,
            height: 26,
            objectFit: "contain",
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  )
}

// A track built from exactly 2 copies only tiles seamlessly up to 2x a single
// copy's width — wider viewports show a stretch of empty background past the
// second copy before the loop restarts. This measures one copy and adds
// enough repeats to always cover at least 2x the viewport.
export default function SponsorMarquee() {
  const reduceMotion = useReducedMotion()
  const measureRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [copies, setCopies] = useState(2)

  useEffect(() => {
    const recompute = () => {
      const stripWidth = measureRef.current?.offsetWidth
      const viewportWidth = containerRef.current?.offsetWidth ?? window.innerWidth
      if (!stripWidth) return
      const needed = Math.max(2, Math.ceil((viewportWidth * 2) / stripWidth) + 1)
      setCopies(needed)
    }
    recompute()
    const ro = new ResizeObserver(recompute)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={{ overflow: "hidden" }}>
      <motion.div
        style={{ display: "flex", width: "max-content", alignItems: "center" }}
        animate={reduceMotion ? undefined : { x: ["0%", `-${100 / copies}%`] }}
        transition={{ duration: 42, ease: "linear", repeat: Infinity }}
      >
        <SponsorStrip innerRef={measureRef} />
        {Array.from({ length: copies - 1 }, (_, i) => (
          <SponsorStrip key={i} hidden />
        ))}
      </motion.div>
    </div>
  )
}
