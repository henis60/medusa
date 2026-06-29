"use client"
import { useState } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion"

export default function BackToTop() {
  const { scrollY } = useScroll()
  const [visible, setVisible] = useState(false)

  useMotionValueEvent(scrollY, "change", (v) => {
    const nearBottom =
      v + window.innerHeight >= document.documentElement.scrollHeight - 200
    setVisible(nearBottom)
  })

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.78, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="btt"
          type="button"
          aria-label="Înapoi sus"
          onMouseEnter={() => document.body.classList.add("hovering")}
          onMouseLeave={() => document.body.classList.remove("hovering")}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M7 14l5-5 5 5z" fill="currentColor" />
          </svg>
          Back to top
        </motion.button>
      )}
    </AnimatePresence>
  )
}
