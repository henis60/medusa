"use client"

import { useEffect, useRef } from "react"
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion"

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const count = useMotionValue(0)
  const displayed = useTransform(count, (v) => `${Math.floor(v)}${suffix}`)
  const inView = useInView(ref, { once: true, amount: 0.4 })

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      count.set(target)
      return
    }
    animate(count, target, {
      duration: 1.6,
      ease: target <= 10 ? "linear" : [1, 0, 0.68, 1],
    })
  }, [inView, count, target, reduced])

  return (
    <motion.div ref={ref} className="bs-num count-num">
      {displayed}
    </motion.div>
  )
}

export default function Bar() {
  return (
    <div className="bar-band" id="bar">
      <div className="bar-band-bg" id="band2"></div>
      <div className="bar-content">
        <div className="kicker rv">
          <span className="kicker-bar"></span>Wine &amp; cocktails
        </div>
        <h2 className="bar-title rv">
          The Hunter
          <br />
          <em>Bar</em>
        </h2>
        <p className="bar-body rv">
          Selecție atentă de whisky, gin, vinuri și cocktailuri clasice. Fiecare
          sticlă aleasă cu grijă. Fiecare seară cu un ritm al ei.
        </p>
        <div className="flex rv" style={{ transitionDelay: "0.12s" }}>
          <div className="bs">
            <CountUp target={80} suffix="+" />
            <div className="bs-lbl">Referințe de vin</div>
          </div>
          <div className="bs">
            <CountUp target={6} />
            <div className="bs-lbl">Cocktailuri signature</div>
          </div>
        </div>
      </div>
    </div>
  )
}
