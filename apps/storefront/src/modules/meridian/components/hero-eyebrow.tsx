"use client"

import { m as motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"

const textTransition = { duration: 0.5, delay: 0.45 }

export default function HeroEyebrow() {
  const t = useTranslations("meridian")
  const reduceMotion = useReducedMotion()

  return (
    <div className="thm-eyebrow-row" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 34 }}>
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
        <span style={{ fontWeight: 700 }}>{t("Ediția I")}</span>
        <span className="thm-eyebrow-sep">&nbsp;·&nbsp;</span>
        <span style={{ fontWeight: 700 }}>{t("26 septembrie 2026")}</span>
      </motion.span>
    </div>
  )
}
