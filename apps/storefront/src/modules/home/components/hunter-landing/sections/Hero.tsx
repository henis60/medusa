"use client"
import { useEffect, useRef, useState } from "react"
// `m` (not `motion`) + the root LazyMotionProvider ([locale]/layout.tsx): the
// animation engine loads asynchronously instead of shipping in the initial JS.
import { m as motion, useScroll, useTransform } from "framer-motion"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useTranslations } from "next-intl"

const Hero = () => {
  const t = useTranslations("home")
  const heroRef = useRef<HTMLElement>(null)
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
            <span className="eyebrow-text">
              {t("Return of the Elegant Gentleman")}
            </span>
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

        </div>
        {/* end hero-top-group */}

        <div>
          <LocalizedClientLink href="/ready-to-wear" className="hero-cta">
            <span className="hero-cta-text">{t("Explorează Colecția")}</span>
          </LocalizedClientLink>
        </div>
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
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
