"use client"

import { motion, useReducedMotion } from "framer-motion"

const lineTransition = { duration: 0.9, ease: [0.23, 1, 0.32, 1] as const, delay: 0.15 }
const textTransition = { duration: 0.5, delay: 0.45 }

export default function HeroEyebrow() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="thm-eyebrow-row" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 34 }}>
      <motion.span
        className="thm-eyebrow-rule-left"
        style={{ height: 1, flex: "0 0 40px", background: "#8b6914", transformOrigin: "right" }}
        initial={reduceMotion ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={lineTransition}
      />
      <motion.span
        className="thm-eyebrow-date"
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontFamily: "var(--rl)",
          fontSize: 11,
          letterSpacing: "0.6em",
          textTransform: "uppercase",
          color: "rgba(201,168,76,0.6)",
          whiteSpace: "nowrap",
        }}
        initial={reduceMotion ? false : { opacity: 0, y: -4 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={textTransition}
      >
        <span>Ediția I</span>
        <span className="thm-eyebrow-sep">&nbsp;·&nbsp;</span>
        <span>26 septembrie 2026</span>
      </motion.span>
      <motion.span
        className="thm-eyebrow-rule-right"
        style={{
          height: 1,
          flex: "1 1 40px",
          background: "linear-gradient(90deg, #8b6914, transparent)",
          transformOrigin: "left",
        }}
        initial={reduceMotion ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={lineTransition}
      />
    </div>
  )
}
