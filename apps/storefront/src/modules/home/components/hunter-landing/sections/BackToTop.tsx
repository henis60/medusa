"use client"
import { useState } from "react"
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion"

export default function BackToTop() {
  const { scrollY } = useScroll()
  const [visible, setVisible] = useState(false)

  useMotionValueEvent(scrollY, "change", (v) => {
    setVisible(v + window.innerHeight >= document.documentElement.scrollHeight - 200)
  })

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          type="button"
          aria-label="Înapoi sus"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid rgba(201,168,76,0.35)",
          }}
          className="fixed z-50 bottom-[70px] right-5 small:right-[50px] flex items-center justify-center cursor-none text-[rgba(201,168,76,0.5)] hover:text-[rgba(201,168,76,0.9)] transition-colors duration-300"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M7 14l5-5 5 5z" fill="currentColor" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
