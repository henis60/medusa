"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

const QuoteBand = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"])

  return (
    <div ref={ref} className="band" id="quote">
      <motion.div
        className="band-bg"
        id="band1"
        style={{
          backgroundImage: "url('/landing/images/quote.webp')",
          y: bgY,
        }}
      />
      <div className="band-body">
        <p className="band-quote">
          &ldquo;Eleganța nu înseamnă să fii remarcat.
          <br />
          Înseamnă să fii <strong>memorat.</strong>&rdquo;
        </p>
        <div className="band-source">&mdash; The Hunter House &mdash;</div>
      </div>
    </div>
  )
}

export default QuoteBand
