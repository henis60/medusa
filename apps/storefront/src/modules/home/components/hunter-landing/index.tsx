"use client"

import React, { useEffect } from "react"
import dynamic from "next/dynamic"

import Hero from "./sections/Hero"
import About from "./sections/About"
import Shop from "./sections/Shop"
import QuoteBand from "./sections/QuoteBand"
import Collections from "./sections/Collections"
import Space from "./sections/Space"
import Events from "./sections/Events"
import Bar from "./sections/Bar"
import GiftCard from "./sections/GiftCard"
import Membership from "./sections/Membership"
import Contact from "./sections/Contact"
import HomepageFooter from "./sections/HomepageFooter"

// Purely decorative, JS-only overlays (custom cursor, section dots,
// back-to-top). No server-rendered/SEO value, so load them after hydration
// instead of shipping them in the critical bundle.
const Cursor = dynamic(() => import("./sections/Cursor"), { ssr: false })
const DotNav = dynamic(() => import("./sections/DotNav"), { ssr: false })
const BackToTop = dynamic(() => import("./sections/BackToTop"), { ssr: false })

const HunterLanding = ({ shopSlot }: { shopSlot?: React.ReactNode }) => {
  useEffect(() => {
    // Mark hydration complete — allows .rv elements to animate
    document.documentElement.classList.add("hydrated")

    const ac = new AbortController()
    const { signal } = ac
    let cancelled = false
    const unsubs: (() => void)[] = []

    document.body.classList.add("hunter-landing-active")

    // Custom cursor hover class on all interactive elements
    document
      .querySelectorAll(
        "a,button,.tf-btn,.pillar,.svc,.ev,.mem,.sw,.mc,.dot-nav a"
      )
      .forEach((el) => {
        el.addEventListener(
          "mouseenter",
          () => document.body.classList.add("hovering"),
          { signal }
        )
        el.addEventListener(
          "mouseleave",
          () => document.body.classList.remove("hovering"),
          { signal }
        )
      })

    // Scroll reveal via Framer Motion — loaded lazily so it's not part of
    // the initial JS bundle needed to render the home page.
    // Skipped under prefers-reduced-motion: CSS already forces .rv content
    // fully visible there (opacity: 1 !important), but a WAAPI animation
    // from Framer Motion isn't a CSS transition/animation, so it isn't
    // covered by the transition-duration: 0.001ms override — left running,
    // it would still drive opacity from 0 back up to 1 on scroll, causing
    // already-visible content to flash out and back in.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (prefersReducedMotion) return

    // Running animation controls, stopped on cleanup — otherwise an effect
    // re-run (StrictMode double-invoke, Fast Refresh) leaves the first pass's
    // WAAPI animations alive. Those commit opacity:1 to the element, and when
    // the re-run's animate() fires with a delay, the delay window paints that
    // committed 1 before jumping to the 0 keyframe — the "visible → vanish →
    // reappear" flicker seen only on delayed .rv elements.
    const controls: { stop: () => void }[] = []

    import("framer-motion").then(({ animate, inView }) => {
      if (cancelled) return

      document
        .querySelectorAll(".rv,.rv-group,.line-draw,.kicker")
        .forEach((el) => {
          const htmlEl = el as HTMLElement
          const isGroup = el.classList.contains("rv-group")
          const isLineDraw = el.classList.contains("line-draw")
          const isKicker =
            el.classList.contains("kicker") && !el.classList.contains("rv")
          const delay = parseFloat(htmlEl.style.transitionDelay || "0")

          let unsub = inView(
            htmlEl,
            () => {
              if (isGroup) {
                const staggerDelays = [0.04, 0.1, 0.16, 0.22, 0.28, 0.34]
                Array.from(el.children).forEach((child, i) => {
                  const childEl = child as HTMLElement
                  // Pin to the hidden from-state synchronously so the delay
                  // window can't paint a previously-committed opacity:1.
                  childEl.style.opacity = "0"
                  childEl.style.transform = "translateY(18px)"
                  controls.push(
                    animate(
                      childEl,
                      {
                        opacity: [0, 1],
                        transform: ["translateY(18px)", "none"],
                      },
                      {
                        duration: 0.5,
                        ease: [0.23, 1, 0.32, 1],
                        delay: staggerDelays[i] ?? i * 0.06,
                      }
                    )
                  )
                })
              } else if (isLineDraw) {
                htmlEl.style.transform = "scaleX(0)"
                controls.push(
                  animate(
                    htmlEl,
                    { transform: ["scaleX(0)", "scaleX(1)"] },
                    { duration: 0.65, ease: [0.23, 1, 0.32, 1] }
                  )
                )
              } else {
                let fromTransform = "translateY(22px)"
                if (el.classList.contains("from-l"))
                  fromTransform = "translateX(-28px)"
                else if (el.classList.contains("from-r"))
                  fromTransform = "translateX(28px)"
                else if (el.classList.contains("scale-in"))
                  fromTransform = "scale(0.94)"
                // Pin to the hidden from-state synchronously so the delay
                // window can't paint a previously-committed opacity:1.
                htmlEl.style.opacity = "0"
                htmlEl.style.transform = fromTransform
                controls.push(
                  animate(
                    htmlEl,
                    { opacity: [0, 1], transform: [fromTransform, "none"] },
                    {
                      duration: 0.55,
                      ease: [0.23, 1, 0.32, 1],
                      delay: isKicker ? 0 : delay,
                    }
                  )
                )
              }
              unsub()
            },
            { amount: 0.25, margin: "0px 0px -80px 0px" }
          )
          unsubs.push(unsub)
        })
    })

    return () => {
      cancelled = true
      unsubs.forEach((unsub) => unsub())
      controls.forEach((c) => c.stop())
      ac.abort()
      document.body.classList.remove("hunter-landing-active")
      document.body.classList.remove("hovering")
    }
  }, [])

  return (
    <div className="hunter-landing">
      <Cursor />
      <DotNav />
      <BackToTop />
      <Hero />
      <About />
      {shopSlot ?? <Shop />}
      <QuoteBand />
      <Collections />
      <Space />
      <Events />
      <Bar />
      <GiftCard />
      <Membership />
      <Contact />
      <HomepageFooter />
    </div>
  )
}

export default HunterLanding
