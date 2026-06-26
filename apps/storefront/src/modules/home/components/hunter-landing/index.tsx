"use client"

import React, { useEffect } from "react"
import { animate, inView } from "framer-motion"

import Hero from "./sections/Hero"
import Newsletter from "./sections/Newsletter"
import Cursor from "./sections/Cursor"
import DotNav from "./sections/DotNav"
import BackToTop from "./sections/BackToTop"
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

const HunterLanding = ({ shopSlot }: { shopSlot?: React.ReactNode }) => {
  useEffect(() => {
    const ac = new AbortController()
    const { signal } = ac

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

    // Scroll reveal via Framer Motion
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
                animate(
                  child as HTMLElement,
                  { opacity: [0, 1], transform: ["translateY(18px)", "none"] },
                  {
                    duration: 0.5,
                    ease: [0.23, 1, 0.32, 1],
                    delay: staggerDelays[i] ?? i * 0.06,
                  }
                )
              })
            } else if (isLineDraw) {
              animate(
                htmlEl,
                { transform: ["scaleX(0)", "scaleX(1)"] },
                { duration: 0.65, ease: [0.23, 1, 0.32, 1] }
              )
            } else {
              let fromTransform = "translateY(22px)"
              if (el.classList.contains("from-l"))
                fromTransform = "translateX(-28px)"
              else if (el.classList.contains("from-r"))
                fromTransform = "translateX(28px)"
              else if (el.classList.contains("scale-in"))
                fromTransform = "scale(0.94)"
              animate(
                htmlEl,
                { opacity: [0, 1], transform: [fromTransform, "none"] },
                {
                  duration: 0.55,
                  ease: [0.23, 1, 0.32, 1],
                  delay: isKicker ? 0 : delay,
                }
              )
            }
            unsub()
          },
          { amount: 0.25, margin: "0px 0px -80px 0px" }
        )
      })

    return () => {
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
      <Newsletter />
      <Contact />
      <HomepageFooter />
    </div>
  )
}

export default HunterLanding
