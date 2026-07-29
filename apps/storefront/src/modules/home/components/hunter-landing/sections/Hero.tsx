"use client"
import { useEffect, useRef, useState } from "react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useTranslations } from "next-intl"

const ease = [0.23, 1, 0.32, 1] as const

const Hero = () => {
  const t = useTranslations("home")
  const heroRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [marqueePaused, setMarqueePaused] = useState(false)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  // Scroll-linked parallax transform on a large full-bleed background image
  // is a common source of scroll jank on mobile browsers (the transform
  // fights with native scrolling/compositing on less powerful GPUs). The
  // mobile hero is a fixed 100svh section anyway, so the parallax adds
  // little visually there — disable it below the tablet breakpoint instead
  // of fighting for smoothness.
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    setIsMobile(mq.matches)
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", listener)
    return () => mq.removeEventListener("change", listener)
  }, [])
  const bgY = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile ? ["0%", "0%"] : ["0%", "35%"]
  )

  const marqueeItems = t.raw("marqueeItems") as string[]
  const items = [...marqueeItems, ...marqueeItems]

  return (
    <section ref={heroRef} className="hero" id="home">
      <motion.div className="hero-bg" aria-hidden="true" style={{ y: bgY }} />

      <div className="hero-grid" aria-hidden="true">
        <div className="hgl" />
        <div className="hgl" />
        <div className="hgl" />
        <div className="hgl" />
        <div className="hgl" />
      </div>

      <div className="scan-line" aria-hidden="true" />

      {/* Hero content */}
      <div className="hero-content">
        <div className="hero-top-group">
          <motion.div
            className="eyebrow"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.15 }}
          >
            <motion.div
              className="eyebrow-line"
              initial={reduced ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.0, ease, delay: 0.4 }}
            />
            <span className="eyebrow-text">
              {t("Return of the Elegant Gentleman")}
            </span>
            <motion.div
              className="eyebrow-line"
              initial={reduced ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.0, ease, delay: 0.5 }}
            />
          </motion.div>

          <div className="hero-logo">
            <div className="logo-l1">
              {"THE HUNTER".split("").map((ch, i) => (
                <span
                  key={i}
                  className="char"
                  style={{ animationDelay: `${0.3 + i * 0.04}s` }}
                >
                  {ch === " " ? " " : ch}
                </span>
              ))}
            </div>
            <div className="logo-l2">
              {"house".split("").map((ch, i) => (
                <span
                  key={i}
                  className="char"
                  style={{ animationDelay: `${0.55 + i * 0.045}s` }}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>

          <motion.div
            className="orn"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.72 }}
          >
            <div className="orn-line" />
            <div className="orn-gem" />
            <div className="orn-line r" />
          </motion.div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.82 }}
          >
            <span className="eyebrow-text">{t("online shop")}</span>
          </motion.div>
        </div>
        {/* end hero-top-group */}

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 1.1 }}
        >
          <LocalizedClientLink href="/ready-to-wear" className="hero-cta">
            <span className="hero-cta-text">{t("Explorează Colecția")}</span>
            <span className="hero-cta-arrow">→</span>
          </LocalizedClientLink>
        </motion.div>
      </div>

      <div
        className="mqstrip"
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 4,
        }}
        onMouseEnter={() => setMarqueePaused(true)}
        onMouseLeave={() => setMarqueePaused(false)}
      >
        <div
          className="mqinner"
          style={{ animationPlayState: marqueePaused ? "paused" : "running" }}
        >
          {items.map((label, i) => (
            <div className="mqitem" key={i}>
              {label} <span className="mqgem">◆</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
