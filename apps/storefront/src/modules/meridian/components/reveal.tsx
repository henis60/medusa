"use client"

import { m as motion, useReducedMotion } from "framer-motion"
import { ReactNode } from "react"

export default function Reveal({
  children,
  delay = 0,
  y = 22,
}: {
  children: ReactNode
  delay?: number
  y?: number
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  )
}
