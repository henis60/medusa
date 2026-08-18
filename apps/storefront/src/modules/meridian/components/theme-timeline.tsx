"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

const CARS = [
  { year: "1952", brand: "Bentley", model: "" },
  { year: "1958", brand: "Mercedes", model: "S-Class" },
  { year: "1963", brand: "Aston Martin", model: "" },
  { year: "1964", brand: "Porsche", model: "911" },
  { year: "1972", brand: "Rolls-Royce", model: "" },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

// Only the text fades/slides in — the diamond markers stay static so they
// never drift off the line during the entrance animation.
const textVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const },
  },
}

const textVariantsV = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const },
  },
}

const TRAVEL_DUR = 1.3
const PAUSE_DUR = 0.12

export default function ThemeTimeline() {
  const reduceMotion = useReducedMotion()
  const [vertical, setVertical] = useState(false)
  const lineRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const diamondRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)")
    const update = () => setVertical(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    const line = lineRef.current
    const dot = dotRef.current
    const diamonds = diamondRefs.current.filter(Boolean) as HTMLSpanElement[]
    if (!line || !dot || diamonds.length !== CARS.length) return

    let stopped = false
    let fracs = [0.1, 0.3, 0.5, 0.7, 0.9]

    const measure = () => {
      const lr = line.getBoundingClientRect()
      const size = vertical ? lr.height : lr.width
      if (!size) return
      fracs = diamonds.map((d) => {
        const dr = d.getBoundingClientRect()
        return vertical
          ? (dr.top + dr.height / 2 - lr.top) / size
          : (dr.left + dr.width / 2 - lr.left) / size
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(line)

    const start = performance.now()
    let raf = 0
    const frame = (now: number) => {
      if (stopped) return
      raf = requestAnimationFrame(frame)
      const total = 6 * TRAVEL_DUR + 5 * PAUSE_DUR
      const t = ((now - start) / 1000) % total
      const points = [0, ...fracs, 1]
      const filled = [false, false, false, false, false]
      let pos = 0
      let acc = 0
      for (let i = 0; i < 6; i++) {
        if (t < acc + TRAVEL_DUR) {
          const p = (t - acc) / TRAVEL_DUR
          pos = points[i] + (points[i + 1] - points[i]) * p
          for (let k = 0; k < i; k++) filled[k] = true
          break
        }
        acc += TRAVEL_DUR
        if (i < 5) {
          if (t < acc + PAUSE_DUR) {
            pos = points[i + 1]
            for (let k = 0; k <= i; k++) filled[k] = true
            break
          }
          acc += PAUSE_DUR
        }
      }
      if (vertical) dot.style.top = pos * 100 + "%"
      else dot.style.left = pos * 100 + "%"
      diamonds.forEach((d, idx) => {
        if (filled[idx]) {
          d.style.background = "#c9a84c"
          d.style.boxShadow = "0 0 0 4px rgba(201,168,76,0.15)"
        } else {
          d.style.background = "#0d1f17"
          d.style.boxShadow = "none"
        }
      })
    }
    raf = requestAnimationFrame(frame)

    return () => {
      stopped = true
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [vertical])

  if (vertical) {
    return (
      <div style={{ position: "relative", margin: "56px 0 0", paddingLeft: 46 }}>
        <div
          ref={lineRef}
          style={{
            position: "absolute",
            left: 15,
            top: 0,
            bottom: 0,
            width: 1,
            background:
              "linear-gradient(180deg, rgba(201,168,76,0.25), rgba(201,168,76,0.85))",
          }}
        >
          <div
            ref={dotRef}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: -5,
              top: "0%",
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: "#fff6e0",
              boxShadow:
                "0 0 4px 1px #fff6e0, 0 0 18px 6px rgba(232,213,163,0.9), 0 0 34px 12px rgba(201,168,76,0.5)",
              transform: "translateY(-50%)",
            }}
          />
        </div>
        <motion.div
          initial={reduceMotion ? undefined : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          style={{ display: "flex", flexDirection: "column", gap: 30 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 13,
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "rgba(201,168,76,0.75)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--rl)",
                fontSize: 10,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: "rgba(201,168,76,0.75)",
              }}
            >
              Clasic
            </span>
          </div>

          {CARS.map((car, i) => (
            <div
              key={car.year}
              style={{ display: "flex", alignItems: "center", gap: 16 }}
            >
              <span
                ref={(el) => {
                  diamondRefs.current[i] = el
                }}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 11,
                  width: 8,
                  height: 8,
                  border: "1.5px solid #c9a84c",
                  background: "#0d1f17",
                  transform: "rotate(45deg)",
                }}
              />
              <motion.div
                variants={textVariantsV}
                style={{ display: "flex", alignItems: "baseline", gap: 12 }}
              >
                <span
                  style={{
                    fontFamily: "var(--rl)",
                    fontSize: 10,
                    letterSpacing: "0.35em",
                    color: "rgba(201,168,76,0.85)",
                    fontFeatureSettings: "'tnum' 1",
                  }}
                >
                  {car.year}
                </span>
                <span
                  style={{
                    fontFamily: "var(--pd)",
                    fontSize: "clamp(16px,4vw,20px)",
                    fontWeight: 400,
                    lineHeight: 1.3,
                    color: "var(--ivory)",
                  }}
                >
                  {car.brand}
                  {car.model ? (
                    <span style={{ color: "rgba(245,240,232,0.6)" }}>
                      {" "}
                      {car.model}
                    </span>
                  ) : null}
                </span>
              </motion.div>
            </div>
          ))}

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 13,
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "rgba(201,168,76,0.75)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--rl)",
                fontSize: 10,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: "rgba(201,168,76,0.75)",
              }}
            >
              Contemporan
            </span>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="thm-timeline-scroll">
      <div className="thm-timeline-inner">
        <div
          ref={lineRef}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 1,
            background:
              "linear-gradient(90deg, rgba(201,168,76,0.25), rgba(201,168,76,0.85))",
          }}
        >
          <div
            ref={dotRef}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -5,
              left: "0%",
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: "#fff6e0",
              boxShadow:
                "0 0 4px 1px #fff6e0, 0 0 18px 6px rgba(232,213,163,0.9), 0 0 34px 12px rgba(201,168,76,0.5)",
              transform: "translateX(-50%)",
            }}
          />
        </div>
        <motion.div
          className="thm-timeline-grid"
          initial={reduceMotion ? undefined : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={containerVariants}
        >
        <div
          style={{
            position: "relative",
            paddingTop: 26,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -3,
              left: 0,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "rgba(201,168,76,0.75)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--rl)",
              fontSize: 10,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.75)",
            }}
          >
            Clasic
          </span>
        </div>

        {CARS.map((car, i) => (
          <div
            key={car.year}
            style={{
              position: "relative",
              paddingTop: 26,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 10,
            }}
          >
            <motion.span
              variants={textVariants}
              style={{
                position: "absolute",
                top: -26,
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "var(--rl)",
                fontSize: 10,
                letterSpacing: "0.35em",
                color: "rgba(201,168,76,0.85)",
                fontFeatureSettings: "'tnum' 1",
              }}
            >
              {car.year}
            </motion.span>
            <span
              ref={(el) => {
                diamondRefs.current[i] = el
              }}
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -4,
                left: "50%",
                marginLeft: -4,
                width: 8,
                height: 8,
                border: "1.5px solid #c9a84c",
                background: "#0d1f17",
                transform: "rotate(45deg)",
              }}
            />
            <motion.span
              variants={textVariants}
              style={{
                fontFamily: "var(--pd)",
                fontSize: "clamp(16px,1.5vw,20px)",
                fontWeight: 400,
                lineHeight: 1.3,
                color: "var(--ivory)",
              }}
            >
              {car.brand}
              {car.model ? (
                <span style={{ color: "rgba(245,240,232,0.6)" }}>
                  {" "}
                  {car.model}
                </span>
              ) : null}
            </motion.span>
          </div>
        ))}

        <div
          style={{
            position: "relative",
            paddingTop: 26,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -3,
              right: 0,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "rgba(201,168,76,0.75)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--rl)",
              fontSize: 10,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.75)",
            }}
          >
            Contemporan
          </span>
        </div>
        </motion.div>
      </div>
    </div>
  )
}
