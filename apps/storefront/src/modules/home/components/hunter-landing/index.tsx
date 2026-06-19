"use client"

import React, { useEffect } from "react"

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
import { initHunterLanding } from "./runtime"

/**
 * THE HUNTER HOUSE — landing page.
 *
 * All sections now rendered as React components. All imperative behaviour
 * runs through initHunterLanding(), which binds to the rendered DOM by
 * id/class — ensuring consistent behavior across all sections.
 */
const HunterLanding = ({ shopSlot }: { shopSlot?: React.ReactNode }) => {
  useEffect(() => {
    const cleanup = initHunterLanding()
    return cleanup
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
