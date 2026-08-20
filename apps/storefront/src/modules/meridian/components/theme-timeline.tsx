"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

const CARS = [
  {
    year: "1952",
    brand: "Bentley",
    model: "",
    modernYear: "2026",
    modernBrand: "Bentley",
    modernModel: "Continental GT",
    gapLabel: "74 de ani",
  },
  {
    year: "1958",
    brand: "Mercedes",
    model: "S-Class",
    modernYear: "2026",
    modernBrand: "Mercedes",
    modernModel: "S-Class",
    gapLabel: "68 de ani",
  },
  {
    year: "Anii '60",
    brand: "Lamborghini",
    model: "Centenario Tractor",
    modernYear: "2026",
    modernBrand: "Lamborghini",
    modernModel: "SVJ",
    gapLabel: "peste 60 de ani",
    highlight: true,
  },
  {
    year: "1976",
    brand: "Porsche",
    model: "911",
    modernYear: "2026",
    modernBrand: "Porsche",
    modernModel: "911",
    gapLabel: "50 de ani",
  },
  {
    year: "1972",
    brand: "Rolls-Royce",
    model: "Phantom I",
    modernYear: "2026",
    modernBrand: "Rolls-Royce",
    modernModel: "Phantom",
    gapLabel: "54 de ani",
  },
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
const TURN_DUR = 0.5
const PAUSE_DUR = 0.12
const ANCHOR_TOP = 40
// Desktop: the line runs out along the classic row, turns at the far edge —
// a sideways U — and comes back along the modern row to end at the same x
// as "Clasic" started, so "Contemporan" lands directly underneath it.
const TOP_Y = 3
const LINE_GAP = 64
const BOTTOM_Y = TOP_Y + LINE_GAP
const RIGHT_X = 92

// Point graph the traveling light walks: out along the top (classic),
// around the turn, back along the bottom (modern) in reverse car order.
// null entries are plain corners/edges with no diamond to light.
const POINT_META: ({ group: "classic" | "modern"; carIndex: number } | null)[] = [
  null,
  { group: "classic", carIndex: 0 },
  { group: "classic", carIndex: 1 },
  { group: "classic", carIndex: 2 },
  { group: "classic", carIndex: 3 },
  { group: "classic", carIndex: 4 },
  null,
  null,
  { group: "modern", carIndex: 4 },
  { group: "modern", carIndex: 3 },
  { group: "modern", carIndex: 2 },
  { group: "modern", carIndex: 1 },
  { group: "modern", carIndex: 0 },
  null,
]
const SEGMENT_COUNT = POINT_META.length - 1
const SEGMENT_DUR = Array.from({ length: SEGMENT_COUNT }, (_, j) =>
  j === 6 ? TURN_DUR : TRAVEL_DUR
)
const SEGMENT_PAUSE = Array.from({ length: SEGMENT_COUNT }, (_, j) =>
  POINT_META[j + 1] ? PAUSE_DUR : 0
)
const LOOP_TOTAL =
  SEGMENT_DUR.reduce((a, b) => a + b, 0) + SEGMENT_PAUSE.reduce((a, b) => a + b, 0)

function igniteStyle(
  d: HTMLSpanElement,
  lit: boolean,
  wasLit: boolean,
  now: number,
  arrivalAt: { current: number }
) {
  const base = d.dataset.baseTransform || ""
  const IGNITE_MS = 550
  if (lit) {
    if (!wasLit) arrivalAt.current = now
    const elapsed = now - arrivalAt.current
    if (elapsed < IGNITE_MS) {
      // Ease-out burst: the diamond flares bright and slightly oversized
      // right as the light reaches it, then settles into its steady lit
      // state — selling the light actually striking it.
      const p = 1 - Math.pow(1 - elapsed / IGNITE_MS, 3)
      const scale = 1.3 - 0.3 * p
      const spread = 11 - 7 * p
      const alpha = 0.75 - 0.6 * p
      d.style.background = p < 0.6 ? "#fff6e0" : "#c9a84c"
      d.style.boxShadow = `0 0 ${spread}px 2px rgba(255,246,224,${alpha}), 0 0 0 4px rgba(201,168,76,0.15)`
      d.style.transform = `${base} scale(${scale})`
    } else {
      d.style.background = "#c9a84c"
      d.style.boxShadow = "0 0 0 4px rgba(201,168,76,0.15)"
      d.style.transform = base
    }
  } else {
    d.style.background = "#0d1f17"
    d.style.boxShadow = "none"
    d.style.transform = base
  }
}

export default function ThemeTimeline() {
  const reduceMotion = useReducedMotion()
  const [vertical, setVertical] = useState(false)
  const lineRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const diamondRefs = useRef<(HTMLSpanElement | null)[]>([])
  const modernDiamondRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)")
    const update = () => setVertical(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  // Vertical (mobile): a single straight line, light travels once through
  // the 5 classic diamonds.
  useEffect(() => {
    if (!vertical) return
    const line = lineRef.current
    const dot = dotRef.current
    const diamonds = diamondRefs.current.filter(Boolean) as HTMLSpanElement[]
    if (!line || !dot || diamonds.length !== CARS.length) return

    let stopped = false
    let fracs = [0.1, 0.3, 0.5, 0.7, 0.9]
    const prevFilled = [false, false, false, false, false]
    const arrivalAt = [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity]

    const measure = () => {
      const lr = line.getBoundingClientRect()
      const size = lr.height
      if (!size) return
      fracs = diamonds.map((d) => {
        const dr = d.getBoundingClientRect()
        return (dr.top + dr.height / 2 - lr.top) / size
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
      dot.style.top = pos * 100 + "%"
      diamonds.forEach((d, idx) => {
        igniteStyle(d, filled[idx], prevFilled[idx], now, {
          get current() {
            return arrivalAt[idx]
          },
          set current(v) {
            arrivalAt[idx] = v
          },
        })
        prevFilled[idx] = filled[idx]
      })
    }
    raf = requestAnimationFrame(frame)

    return () => {
      stopped = true
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [vertical])

  // Desktop: the light runs the whole sideways-U — out along the classic
  // row, around the turn, back along the modern row.
  useEffect(() => {
    if (vertical) return
    const line = lineRef.current
    const dot = dotRef.current
    const classicDiamonds = diamondRefs.current.filter(Boolean) as HTMLSpanElement[]
    const modernDiamonds = modernDiamondRefs.current.filter(Boolean) as HTMLSpanElement[]
    if (
      !line ||
      !dot ||
      classicDiamonds.length !== CARS.length ||
      modernDiamonds.length !== CARS.length
    )
      return

    let stopped = false
    let fracs = [0.1, 0.3, 0.5, 0.7, 0.9]
    const classicPrev = [false, false, false, false, false]
    const modernPrev = [false, false, false, false, false]
    const classicArrival = [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity]
    const modernArrival = [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity]

    const measure = () => {
      const lr = line.getBoundingClientRect()
      if (!lr.width) return
      fracs = classicDiamonds.map((d) => {
        const dr = d.getBoundingClientRect()
        return (dr.left + dr.width / 2 - lr.left) / lr.width
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
      const t = ((now - start) / 1000) % LOOP_TOTAL
      const [f0, f1, f2, f3, f4] = fracs
      const xs = [0, f0, f1, f2, f3, f4, 1, 1, f4, f3, f2, f1, f0, 0]
      const classicFilled = [false, false, false, false, false]
      const modernFilled = [false, false, false, false, false]

      const markUpTo = (pointIdx: number) => {
        for (let p = 1; p <= pointIdx; p++) {
          const meta = POINT_META[p]
          if (!meta) continue
          if (meta.group === "classic") classicFilled[meta.carIndex] = true
          else modernFilled[meta.carIndex] = true
        }
      }

      let x = xs[0]
      let y = TOP_Y
      let acc = 0
      for (let j = 0; j < SEGMENT_COUNT; j++) {
        const dur = SEGMENT_DUR[j]
        const y0 = j <= 6 ? TOP_Y : BOTTOM_Y
        const y1 = j + 1 <= 6 ? TOP_Y : BOTTOM_Y
        if (t < acc + dur) {
          const p = (t - acc) / dur
          x = xs[j] + (xs[j + 1] - xs[j]) * p
          y = y0 + (y1 - y0) * p
          markUpTo(j)
          break
        }
        acc += dur
        const pause = SEGMENT_PAUSE[j]
        if (pause > 0) {
          if (t < acc + pause) {
            x = xs[j + 1]
            y = y1
            markUpTo(j + 1)
            break
          }
          acc += pause
        }
      }

      dot.style.left = x * 100 + "%"
      dot.style.top = `${y - 5.5}px`

      classicDiamonds.forEach((d, idx) => {
        igniteStyle(d, classicFilled[idx], classicPrev[idx], now, {
          get current() {
            return classicArrival[idx]
          },
          set current(v) {
            classicArrival[idx] = v
          },
        })
        classicPrev[idx] = classicFilled[idx]
      })
      modernDiamonds.forEach((d, idx) => {
        igniteStyle(d, modernFilled[idx], modernPrev[idx], now, {
          get current() {
            return modernArrival[idx]
          },
          set current(v) {
            modernArrival[idx] = v
          },
        })
        modernPrev[idx] = modernFilled[idx]
      })
    }
    raf = requestAnimationFrame(frame)

    return () => {
      stopped = true
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [vertical])

  const LINE_X = 96

  if (vertical) {
    return (
      <div style={{ position: "relative", margin: "56px 0 0" }}>
        <div
          ref={lineRef}
          style={{
            position: "absolute",
            left: LINE_X,
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
          style={{ display: "flex", flexDirection: "column", gap: 26 }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                width: LINE_X - 10,
                flexShrink: 0,
                textAlign: "right",
                fontFamily: "var(--rl)",
                fontSize: 10,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: "rgba(201,168,76,0.75)",
              }}
            >
              Clasic
            </span>
            <div style={{ width: 20, flexShrink: 0 }} />
            <span
              style={{
                flex: 1,
                paddingLeft: 10,
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

          {CARS.map((car, i) => (
            <div key={car.year} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: LINE_X - 10,
                  flexShrink: 0,
                  textAlign: "right",
                }}
              >
                <motion.div variants={textVariantsV}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "flex-end",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--pd)",
                        fontSize: car.highlight
                          ? "clamp(16px,4vw,19px)"
                          : "clamp(14px,3.6vw,17px)",
                        fontWeight: car.highlight ? 500 : 400,
                        lineHeight: 1.25,
                        color: car.highlight ? "#f5e6b8" : "var(--ivory)",
                      }}
                    >
                      {car.brand}
                      {car.model ? (
                        <span style={{ color: "rgba(245,240,232,0.55)" }}>
                          {" "}
                          {car.model}
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--rl)",
                      fontSize: 10,
                      letterSpacing: "0.3em",
                      color: car.highlight ? "#f5e6b8" : "rgba(201,168,76,0.75)",
                      fontFeatureSettings: "'tnum' 1",
                      marginTop: 3,
                    }}
                  >
                    {car.year}
                  </span>
                </motion.div>
              </div>
              <div
                style={{
                  width: 20,
                  flexShrink: 0,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <span
                  ref={(el) => {
                    diamondRefs.current[i] = el
                  }}
                  data-base-transform="rotate(45deg)"
                  aria-hidden="true"
                  style={{
                    width: car.highlight ? 11 : 8,
                    height: car.highlight ? 11 : 8,
                    border: car.highlight
                      ? "1.5px solid #f5e6b8"
                      : "1.5px solid #c9a84c",
                    background: "#0d1f17",
                    boxShadow: car.highlight
                      ? "0 0 10px 2px rgba(245,230,184,0.45)"
                      : undefined,
                    transform: "rotate(45deg)",
                  }}
                />
              </div>
              <div style={{ flex: 1, paddingLeft: 10 }}>
                <motion.div variants={textVariantsV}>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--cg)",
                      fontSize: 13,
                      fontStyle: "italic",
                      color: car.highlight
                        ? "rgba(245,230,184,0.9)"
                        : "rgba(201,168,76,0.6)",
                    }}
                  >
                    {car.modernYear} {car.modernBrand} {car.modernModel}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--rl)",
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: car.highlight
                        ? "rgba(245,230,184,0.7)"
                        : "rgba(232,213,163,0.45)",
                      marginTop: 3,
                    }}
                  >
                    {car.gapLabel}
                  </span>
                </motion.div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    )
  }

  const SVG_H = BOTTOM_Y + 20
  const spacerH = LINE_GAP - 14

  return (
    <div className="thm-timeline-scroll">
      <div className="thm-timeline-inner">
        <svg
          aria-hidden="true"
          viewBox={`0 0 100 ${SVG_H}`}
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: ANCHOR_TOP,
            width: "100%",
            height: SVG_H,
            overflow: "visible",
          }}
        >
          <defs>
            <linearGradient id="thm-arc-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(201,168,76,0.7)" />
              <stop offset="92%" stopColor="rgba(201,168,76,0.85)" />
              <stop offset="100%" stopColor="rgba(201,168,76,0.4)" />
            </linearGradient>
          </defs>
          <path
            d={`M 0,${TOP_Y} H ${RIGHT_X} Q 100,${TOP_Y} 100,${
              (TOP_Y + BOTTOM_Y) / 2
            } Q 100,${BOTTOM_Y} ${RIGHT_X},${BOTTOM_Y} H 0`}
            fill="none"
            stroke="url(#thm-arc-grad)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div
          ref={lineRef}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: ANCHOR_TOP,
            height: 1,
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
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              height: ANCHOR_TOP,
              display: "flex",
              alignItems: "flex-end",
            }}
          >
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
          <div style={{ height: 14 }} />
          <div style={{ height: spacerH }} />
          <div style={{ height: 14, display: "flex", alignItems: "center" }}>
            <span
              style={{
                marginTop: 8,
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
        </div>

        {CARS.map((car, i) => (
          <div
            key={car.year}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              style={{
                height: ANCHOR_TOP,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <motion.span
                variants={textVariants}
                style={{
                  fontFamily: "var(--rl)",
                  fontSize: 10,
                  letterSpacing: "0.35em",
                  color: car.highlight ? "#f5e6b8" : "rgba(201,168,76,0.85)",
                  fontFeatureSettings: "'tnum' 1",
                }}
              >
                {car.year}
              </motion.span>
              <motion.span
                variants={textVariants}
                style={{
                  fontFamily: "var(--pd)",
                  fontSize: car.highlight
                    ? "clamp(17px,1.7vw,22px)"
                    : "clamp(16px,1.5vw,20px)",
                  fontWeight: car.highlight ? 500 : 400,
                  lineHeight: 1.3,
                  marginTop: 2,
                  color: car.highlight ? "#f5e6b8" : "var(--ivory)",
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
            <div
              style={{
                height: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                ref={(el) => {
                  diamondRefs.current[i] = el
                }}
                data-base-transform="rotate(45deg)"
                aria-hidden="true"
                style={{
                  width: car.highlight ? 11 : 8,
                  height: car.highlight ? 11 : 8,
                  border: car.highlight
                    ? "1.5px solid #f5e6b8"
                    : "1.5px solid #c9a84c",
                  background: "#0d1f17",
                  boxShadow: car.highlight
                    ? "0 0 10px 2px rgba(245,230,184,0.45)"
                    : undefined,
                  transform: "rotate(45deg)",
                }}
              />
            </div>
            <div style={{ height: spacerH }} />
            <div
              style={{
                height: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                ref={(el) => {
                  modernDiamondRefs.current[i] = el
                }}
                data-base-transform="rotate(45deg)"
                aria-hidden="true"
                style={{
                  width: car.highlight ? 11 : 8,
                  height: car.highlight ? 11 : 8,
                  border: car.highlight
                    ? "1.5px solid #f5e6b8"
                    : "1.5px solid #c9a84c",
                  background: "#0d1f17",
                  boxShadow: car.highlight
                    ? "0 0 10px 2px rgba(245,230,184,0.45)"
                    : undefined,
                  transform: "rotate(45deg)",
                }}
              />
            </div>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <motion.span
                variants={textVariants}
                style={{
                  fontFamily: "var(--cg)",
                  fontSize: 12,
                  fontStyle: "italic",
                  color: car.highlight
                    ? "rgba(245,230,184,0.9)"
                    : "rgba(201,168,76,0.6)",
                }}
              >
                {car.modernYear} {car.modernBrand} {car.modernModel}
              </motion.span>
              <motion.span
                variants={textVariants}
                style={{
                  fontFamily: "var(--rl)",
                  fontSize: 9,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: car.highlight
                    ? "rgba(245,230,184,0.7)"
                    : "rgba(232,213,163,0.45)",
                  marginTop: 2,
                }}
              >
                {car.gapLabel}
              </motion.span>
            </div>
          </div>
        ))}
        </motion.div>
      </div>
    </div>
  )
}
