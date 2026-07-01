"use client"

import { useEffect } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export default function Cursor() {
  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)

  // Ring lags behind with a spring — mimics the original lerp (rx += (mx-rx)*0.1)
  const rx = useSpring(mx, { stiffness: 55, damping: 16, mass: 0.6 })
  const ry = useSpring(my, { stiffness: 55, damping: 16, mass: 0.6 })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mx.set(e.clientX)
      my.set(e.clientY)
    }
    document.addEventListener("mousemove", handler)
    return () => document.removeEventListener("mousemove", handler)
  }, [mx, my])

  return (
    <>
      {/* Main dot — follows mouse exactly */}
      <motion.div id="cur" aria-hidden="true" style={{ left: mx, top: my }} />
      {/* Trailing ring — springs behind */}
      <motion.div id="curR" aria-hidden="true" style={{ left: rx, top: ry }} />
    </>
  )
}
