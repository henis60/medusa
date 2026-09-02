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
  // Scroll-linked parallax on mobile turned out to still cause scroll jank
  // on less powerful GPUs even at a reduced magnitude — disabled outright
  // there rather than just toned down.
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
          {/* No entrance animation: this text is the page's LCP candidate.
              Chrome excludes opacity:0 elements from LCP, so animating it in
              (even just a y-offset, visible pre-animation at full opacity)
              either delays or visibly glitches the very first paint. The
              decorative underline still animates below. */}
          <div className="eyebrow">
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
          </div>

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

          <div>
            <span className="eyebrow-text">{t("online shop")}</span>
          </div>
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
