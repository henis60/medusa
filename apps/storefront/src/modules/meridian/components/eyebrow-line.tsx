"use client"

import { motion, useReducedMotion } from "framer-motion"

const lineTransition = {
  duration: 0.9,
  ease: [0.23, 1, 0.32, 1] as const,
  delay: 0.15,
}

export default function EyebrowLine({
  style,
}: {
  style: React.CSSProperties
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.span
      style={{ ...style, transformOrigin: "left" }}
      initial={reduceMotion ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={lineTransition}
    />
  )
}
