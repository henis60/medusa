"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const CARS = [
  {
    year: "1936",
    brand: "Rolls-Royce",
    model: "Phantom I",
    modernYear: "",
    modernBrand: "Rolls-Royce",
    modernModel: "Spectre",
  },
  {
    year: "1952",
    brand: "Bentley",
    model: "",
    modernYear: "",
    modernBrand: "Bentley",
    modernModel: "Continental GT",
  },
  {
    year: "",
    brand: "Lamborghini",
    model: "Centenario Tractor",
    modernYear: "",
    modernBrand: "Lamborghini",
    modernModel: "Aventador SVJ",
    highlight: true,
  },
  {
    year: "1958",
    brand: "Mercedes",
    model: "S-Class",
    modernYear: "",
    modernBrand: "Mercedes",
    modernModel: "S-Class Maybach",
  },
  {
    year: "1976",
    brand: "Porsche",
    model: "911",
    modernYear: "",
    modernBrand: "Porsche",
    modernModel: "911 Turbo S",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

// Only the text fades/slides in — the diamond markers stay static so they
// never drift off the line during the entrance animation.
const textVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const },
  },
};

const textVariantsV = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const },
  },
};

const TRAVEL_DUR = 1.3;
const TURN_DUR = 0.5;
const PAUSE_DUR = 0.12;
const ANCHOR_TOP = 40;
// Desktop: the line runs out along the classic row, turns at the far edge —
// a sideways U — and comes back along the modern row to end at the same x
// as "Clasic" started, so "Contemporan" lands directly underneath it.
const TOP_Y = 3;
const LINE_GAP = 64;
const BOTTOM_Y = TOP_Y + LINE_GAP;
const RIGHT_X = 92;
const MARKER_ROW_H = TOP_Y * 2;
const MARKER_SPACER_H = LINE_GAP - MARKER_ROW_H;

// Point graph the traveling light walks: out along the top (classic),
// around the turn, back along the bottom (modern) in reverse car order.
// null entries are plain corners/edges with no diamond to light.
const POINT_META: ({ group: "classic" | "modern"; carIndex: number } | null)[] =
  [
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
  ];
const SEGMENT_COUNT = POINT_META.length - 1;
const SEGMENT_DUR: number[] = Array.from({ length: SEGMENT_COUNT }, (_, j) =>
  j === 6 ? TURN_DUR : TRAVEL_DUR,
);
const SEGMENT_PAUSE: number[] = Array.from({ length: SEGMENT_COUNT }, (_, j) =>
  POINT_META[j + 1] ? PAUSE_DUR : 0,
);
const LOOP_TOTAL =
  SEGMENT_DUR.reduce((a, b) => a + b, 0) +
  SEGMENT_PAUSE.reduce((a, b) => a + b, 0);

function igniteStyle(
  d: HTMLSpanElement,
  lit: boolean,
  wasLit: boolean,
  now: number,
  arrivalAt: { current: number },
) {
  const base = d.dataset.baseTransform || "";
  const IGNITE_MS = 550;
  if (lit) {
    // Keep the hit/ignite response snappy while the marker is being lit.
    d.style.transition = "none";
    if (!wasLit) arrivalAt.current = now;
    const elapsed = now - arrivalAt.current;
    if (elapsed < IGNITE_MS) {
      // Ease-out burst: the diamond flares bright and slightly oversized
      // right as the light reaches it, then settles into its steady lit
      // state — selling the light actually striking it.
      const p = 1 - Math.pow(1 - elapsed / IGNITE_MS, 3);
      const scale = 1.3 - 0.3 * p;
      const spread = 11 - 7 * p;
      const alpha = 0.75 - 0.6 * p;
      d.style.background = p < 0.6 ? "#fff6e0" : "#c9a84c";
      d.style.boxShadow = `0 0 ${spread}px 2px rgba(255,246,224,${alpha}), 0 0 0 4px rgba(201,168,76,0.15)`;
      d.style.transform = `${base} scale(${scale})`;
    } else {
      d.style.background = "#c9a84c";
      d.style.boxShadow = "0 0 0 4px rgba(201,168,76,0.15)";
      d.style.transform = base;
    }
  } else {
    // On loop reset, fade all light energy out instead of hard cutting to dark.
    d.style.transition =
      "background-color 420ms ease-out, box-shadow 420ms ease-out, transform 420ms ease-out";
    d.style.background = "#0d1f17";
    d.style.boxShadow = "none";
    d.style.transform = base;
  }
}

function setTravelDotIntensity(dot: HTMLDivElement, intensity: number) {
  const v = Math.max(0.12, Math.min(1, intensity));
  dot.style.opacity = `${0.35 + 0.65 * v}`;
  dot.style.background = `rgba(255,246,224,${0.25 + 0.75 * v})`;
  dot.style.boxShadow = `0 0 4px 1px rgba(255,246,224,${
    0.12 + 0.88 * v
  }), 0 0 18px 6px rgba(232,213,163,${
    0.08 + 0.82 * v
  }), 0 0 34px 12px rgba(201,168,76,${0.03 + 0.47 * v})`;
}

export default function ThemeTimeline() {
  const reduceMotion = useReducedMotion();
  const [vertical, setVertical] = useState(false);
  const [tablet, setTablet] = useState(false);
  const lineRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const mobilePathRef = useRef<SVGPathElement>(null);
  const diamondRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const modernDiamondRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setVertical(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 641px) and (max-width: 1024px)");
    const update = () => setTablet(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Vertical (mobile): a single straight line, light travels once through
  // the 5 classic diamonds.
  useEffect(() => {
    if (!vertical) return;
    const line = lineRef.current;
    const dot = dotRef.current;
    const path = mobilePathRef.current;
    const diamonds = diamondRefs.current.filter(Boolean) as HTMLSpanElement[];
    const modernDiamonds = modernDiamondRefs.current.filter(
      Boolean,
    ) as HTMLSpanElement[];
    if (
      !line ||
      !dot ||
      !path ||
      diamonds.length !== CARS.length ||
      modernDiamonds.length !== CARS.length
    )
      return;

    let stopped = false;
    let fracs = [0.1, 0.3, 0.5, 0.7, 0.9];
    let modernFracs = [0.1, 0.3, 0.5, 0.7, 0.9];
    const MOBILE_U_WIDTH = 28;
    const MOBILE_U_BEND = 20;
    const classicPrev = [false, false, false, false, false];
    const modernPrev = [false, false, false, false, false];
    const classicArrival = [
      -Infinity,
      -Infinity,
      -Infinity,
      -Infinity,
      -Infinity,
    ];
    const modernArrival = [
      -Infinity,
      -Infinity,
      -Infinity,
      -Infinity,
      -Infinity,
    ];
    let lineSize = 0;
    let railWidth = MOBILE_U_WIDTH;
    let pathLen = 0;
    let bendLen = 0;

    const measure = () => {
      const lr = line.getBoundingClientRect();
      const size = lr.height;
      if (!size) return;
      lineSize = size;
      fracs = diamonds.map((d) => {
        const dr = d.getBoundingClientRect();
        return (dr.top + dr.height / 2 - lr.top) / size;
      });
      modernFracs = modernDiamonds.map((d) => {
        const dr = d.getBoundingClientRect();
        return (dr.top + dr.height / 2 - lr.top) / size;
      });

      if (path) {
        const container = line.parentElement;
        if (!container) return;
        const cr = container.getBoundingClientRect();
        const xLeftRaw =
          diamonds.reduce((sum, d) => {
            const dr = d.getBoundingClientRect();
            return sum + (dr.left + dr.width / 2 - cr.left);
          }, 0) / diamonds.length;
        const xRightRaw =
          modernDiamonds.reduce((sum, d) => {
            const dr = d.getBoundingClientRect();
            return sum + (dr.left + dr.width / 2 - cr.left);
          }, 0) / modernDiamonds.length;
        const xLeft = Math.round(xLeftRaw * 2) / 2;
        const xRight = Math.round(xRightRaw * 2) / 2;
        railWidth = Math.max(12, xRight - xLeft);
        line.style.left = `${xLeft}px`;
        const yTop = 0;
        const yBottom = size;
        const xMid = (xLeft + xRight) / 2;
        path.setAttribute(
          "d",
          `M ${xLeft},${yTop} L ${xLeft},${yBottom} Q ${xMid},${
            yBottom + MOBILE_U_BEND
          } ${xRight},${yBottom} L ${xRight},${yTop}`,
        );
        pathLen = path.getTotalLength();
        bendLen = Math.max(0, pathLen - 2 * size);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(line);
    if (line.parentElement) ro.observe(line.parentElement);
    window.addEventListener("resize", measure);

    // One global speed for the whole path (top run + bend + bottom run) so
    // the dot doesn't appear to slow down while it's on the curved part —
    // every segment's duration is proportional to its real pixel length.
    const TARGET_TRAVEL_TOTAL = SEGMENT_DUR.reduce((a, b) => a + b, 0);

    const start = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      if (stopped) return;
      raf = requestAnimationFrame(frame);
      const points = [0, ...fracs, 1];
      const rightStops = modernFracs
        .map((f, idx) => ({ p: 1 - f, idx }))
        .sort((a, b) => a.p - b.p);
      const rightPoints = [0, ...rightStops.map((s) => s.p), 1];

      const segLenPx = Array.from({ length: SEGMENT_COUNT }, (_, j) => {
        if (j === 6) return bendLen;
        if (j < 6) return Math.abs(points[j + 1] - points[j]) * lineSize;
        const k = j - 7;
        return Math.abs(rightPoints[k + 1] - rightPoints[k]) * lineSize;
      });
      const totalLenPx = segLenPx.reduce((a, b) => a + b, 0);
      const segDur =
        totalLenPx > 0
          ? segLenPx.map((len) => (len / totalLenPx) * TARGET_TRAVEL_TOTAL)
          : SEGMENT_DUR;

      const total =
        segDur.reduce((a, b) => a + b, 0) +
        SEGMENT_PAUSE.reduce((a, b) => a + b, 0);
      const t = ((now - start) / 1000) % total;
      const classicFilled = [false, false, false, false, false];
      const modernFilled = [false, false, false, false, false];
      let currLen = 0;
      let dotIntensity = 1;
      // POINT_META's modern carIndex assumes fracs ascending with car order
      // (true on desktop by construction); on mobile the real car index at
      // each modern stop comes from rightStops' own sort instead.
      const modernCarAt = (pointIdx: number) => rightStops[pointIdx - 8]?.idx;
      const markUpTo = (pointIdx: number) => {
        for (let k = 1; k <= pointIdx; k++) {
          const meta = POINT_META[k];
          if (!meta) continue;
          if (meta.group === "classic") classicFilled[meta.carIndex] = true;
          else {
            const carIdx = modernCarAt(k);
            if (carIdx !== undefined) modernFilled[carIdx] = true;
          }
        }
      };

      let acc = 0;
      let lenAcc = 0;
      for (let j = 0; j < SEGMENT_COUNT; j++) {
        const dur = segDur[j];
        if (t < acc + dur) {
          const p = dur > 0 ? (t - acc) / dur : 0;
          currLen = lenAcc + segLenPx[j] * p;
          if (POINT_META[j + 1] && p > 0.94) {
            const hitEase = (p - 0.94) / 0.06;
            dotIntensity = 1 - 0.75 * hitEase;
          }
          markUpTo(j);
          break;
        }
        acc += dur;
        lenAcc += segLenPx[j];
        const pause = SEGMENT_PAUSE[j];
        if (pause > 0) {
          if (t < acc + pause) {
            currLen = lenAcc;
            dotIntensity = 0.18;
            markUpTo(j + 1);
            break;
          }
          acc += pause;
        }
      }

      const pt = path.getPointAtLength(Math.max(0, Math.min(pathLen, currLen)));
      const lineLeft = line.offsetLeft;
      dot.style.top = `${pt.y - 5.5}px`;
      dot.style.left = `${pt.x - lineLeft - 5.5}px`;
      dot.style.transform = "none";
      setTravelDotIntensity(dot, dotIntensity);
      diamonds.forEach((d, idx) => {
        igniteStyle(d, classicFilled[idx], classicPrev[idx], now, {
          get current() {
            return classicArrival[idx];
          },
          set current(v) {
            classicArrival[idx] = v;
          },
        });
        classicPrev[idx] = classicFilled[idx];
      });

      modernDiamonds.forEach((d, idx) => {
        igniteStyle(d, modernFilled[idx], modernPrev[idx], now, {
          get current() {
            return modernArrival[idx];
          },
          set current(v) {
            modernArrival[idx] = v;
          },
        });
        modernPrev[idx] = modernFilled[idx];
      });
    };
    raf = requestAnimationFrame(frame);

    return () => {
      stopped = true;
      ro.disconnect();
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
    };
  }, [vertical]);

  // Desktop: the light runs the whole sideways-U — out along the classic
  // row, around the turn, back along the modern row.
  useEffect(() => {
    if (vertical) return;
    const line = lineRef.current;
    const dot = dotRef.current;
    const classicDiamonds = diamondRefs.current.filter(
      Boolean,
    ) as HTMLSpanElement[];
    const modernDiamonds = modernDiamondRefs.current.filter(
      Boolean,
    ) as HTMLSpanElement[];
    if (
      !line ||
      !dot ||
      classicDiamonds.length !== CARS.length ||
      modernDiamonds.length !== CARS.length
    )
      return;

    let stopped = false;
    let fracs = [0.1, 0.3, 0.5, 0.7, 0.9];
    const classicPrev = [false, false, false, false, false];
    const modernPrev = [false, false, false, false, false];
    const classicArrival = [
      -Infinity,
      -Infinity,
      -Infinity,
      -Infinity,
      -Infinity,
    ];
    const modernArrival = [
      -Infinity,
      -Infinity,
      -Infinity,
      -Infinity,
      -Infinity,
    ];
    const TARGET_TRAVEL_TOTAL = SEGMENT_DUR.reduce((a, b) => a + b, 0);
    const rightEdge = RIGHT_X / 100;
    const turnMidY = (TOP_Y + BOTTOM_Y) / 2;
    const TURN_SAMPLE_COUNT = 120;
    let turnLookup: { s: number; x: number; y: number }[] = [];
    let turnLengthPx = 0;
    let lineWidth = 0;

    const turnPointAt = (q: number) => {
      if (q <= 0.5) {
        const u = q * 2;
        const inv = 1 - u;
        return {
          x: inv * inv * rightEdge + 2 * inv * u * 1 + u * u * 1,
          y: inv * inv * TOP_Y + 2 * inv * u * TOP_Y + u * u * turnMidY,
        };
      }
      const u = (q - 0.5) * 2;
      const inv = 1 - u;
      return {
        x: inv * inv * 1 + 2 * inv * u * 1 + u * u * rightEdge,
        y: inv * inv * turnMidY + 2 * inv * u * BOTTOM_Y + u * u * BOTTOM_Y,
      };
    };

    const buildTurnLookup = (lineWidthPx: number) => {
      const pts: { s: number; x: number; y: number }[] = [];
      let total = 0;
      let prev = turnPointAt(0);
      pts.push({ s: 0, x: prev.x, y: prev.y });

      for (let n = 1; n <= TURN_SAMPLE_COUNT; n++) {
        const q = n / TURN_SAMPLE_COUNT;
        const curr = turnPointAt(q);
        total += Math.hypot((curr.x - prev.x) * lineWidthPx, curr.y - prev.y);
        pts.push({ s: total, x: curr.x, y: curr.y });
        prev = curr;
      }

      if (total > 0) {
        for (const p of pts) p.s /= total;
      }
      return { pts, total };
    };

    const pointOnTurnByArc = (sNorm: number) => {
      if (!turnLookup.length) return turnPointAt(sNorm);
      if (sNorm <= 0) return turnLookup[0];
      if (sNorm >= 1) return turnLookup[turnLookup.length - 1];

      let hi = 1;
      while (hi < turnLookup.length && turnLookup[hi].s < sNorm) hi++;
      const lo = hi - 1;
      const a = turnLookup[lo];
      const b = turnLookup[hi];
      const span = b.s - a.s || 1;
      const u = (sNorm - a.s) / span;
      return {
        x: a.x + (b.x - a.x) * u,
        y: a.y + (b.y - a.y) * u,
      };
    };

    const measure = () => {
      const lr = line.getBoundingClientRect();
      if (!lr.width) return;
      lineWidth = lr.width;
      fracs = classicDiamonds.map((d) => {
        const dr = d.getBoundingClientRect();
        return (dr.left + dr.width / 2 - lr.left) / lr.width;
      });
      const turnData = buildTurnLookup(lr.width);
      turnLookup = turnData.pts;
      turnLengthPx = turnData.total;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(line);

    const start = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      if (stopped) return;
      raf = requestAnimationFrame(frame);
      const t = ((now - start) / 1000) % LOOP_TOTAL;
      const [f0, f1, f2, f3, f4] = fracs;
      const xs = [
        0,
        f0,
        f1,
        f2,
        f3,
        f4,
        rightEdge,
        rightEdge,
        f4,
        f3,
        f2,
        f1,
        f0,
        0,
      ];
      const segLenPx = Array.from({ length: SEGMENT_COUNT }, (_, j) =>
        j === 6 ? turnLengthPx : Math.abs(xs[j + 1] - xs[j]) * lineWidth,
      );
      const totalLenPx = segLenPx.reduce((a, b) => a + b, 0);
      const segDur =
        totalLenPx > 0
          ? segLenPx.map((len) => (len / totalLenPx) * TARGET_TRAVEL_TOTAL)
          : SEGMENT_DUR;
      const classicFilled = [false, false, false, false, false];
      const modernFilled = [false, false, false, false, false];

      const markUpTo = (pointIdx: number) => {
        for (let p = 1; p <= pointIdx; p++) {
          const meta = POINT_META[p];
          if (!meta) continue;
          if (meta.group === "classic") classicFilled[meta.carIndex] = true;
          else modernFilled[meta.carIndex] = true;
        }
      };

      let x = xs[0];
      let y = TOP_Y;
      let dotIntensity = 1;
      let acc = 0;
      for (let j = 0; j < SEGMENT_COUNT; j++) {
        const dur = segDur[j];
        if (t < acc + dur) {
          const p = dur > 0 ? (t - acc) / dur : 0;
          if (j === 6) {
            const pt = pointOnTurnByArc(p);
            x = pt.x;
            y = pt.y;
          } else {
            x = xs[j] + (xs[j + 1] - xs[j]) * p;
            y = j <= 5 ? TOP_Y : BOTTOM_Y;
          }
          if (POINT_META[j + 1] && p > 0.94) {
            const hitEase = (p - 0.94) / 0.06;
            dotIntensity = 1 - 0.75 * hitEase;
          }
          markUpTo(j);
          break;
        }
        acc += dur;
        const pause = SEGMENT_PAUSE[j];
        if (pause > 0) {
          if (t < acc + pause) {
            x = xs[j + 1];
            y = j + 1 <= 6 ? TOP_Y : BOTTOM_Y;
            if (POINT_META[j + 1]) dotIntensity = 0.18;
            markUpTo(j + 1);
            break;
          }
          acc += pause;
        }
      }

      dot.style.left = x * 100 + "%";
      dot.style.top = `${y - 5.5}px`;
      setTravelDotIntensity(dot, dotIntensity);

      classicDiamonds.forEach((d, idx) => {
        igniteStyle(d, classicFilled[idx], classicPrev[idx], now, {
          get current() {
            return classicArrival[idx];
          },
          set current(v) {
            classicArrival[idx] = v;
          },
        });
        classicPrev[idx] = classicFilled[idx];
      });
      modernDiamonds.forEach((d, idx) => {
        igniteStyle(d, modernFilled[idx], modernPrev[idx], now, {
          get current() {
            return modernArrival[idx];
          },
          set current(v) {
            modernArrival[idx] = v;
          },
        });
        modernPrev[idx] = modernFilled[idx];
      });
    };
    raf = requestAnimationFrame(frame);

    return () => {
      stopped = true;
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [vertical]);

  if (vertical) {
    return (
      <div
        style={{
          position: "relative",
          margin: "56px auto 0",
          width: "100%",
          maxWidth: 640,
        }}
      >
        <svg
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <defs>
            <linearGradient
              id="thm-mobile-curve-grad"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="rgba(201,168,76,0.25)" />
              <stop offset="100%" stopColor="rgba(201,168,76,0.85)" />
            </linearGradient>
          </defs>
          <path
            ref={mobilePathRef}
            d=""
            fill="none"
            stroke="url(#thm-mobile-curve-grad)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div
          ref={lineRef}
          style={{
            position: "absolute",
            left: "calc(50% - 18px)",
            top: 0,
            bottom: 0,
            width: 1,
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
                flex: "1 1 0",
                minWidth: 0,
                paddingRight: 24,
                textAlign: "center",
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
            <div style={{ width: 36, flexShrink: 0 }} />
            <span
              style={{
                flex: "1 1 0",
                minWidth: 0,
                paddingLeft: 8,
                textAlign: "center",
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

          {CARS.map((car, i) =>
            (() => {
              const isHighlighted =
                car.brand === "Lamborghini" &&
                car.model === "Centenario Tractor";
              const isRollsRoyce = car.brand === "Rolls-Royce";
              const isPhantomI =
                car.brand === "Rolls-Royce" && car.model === "Phantom I";
              return (
                <div
                  key={`${car.brand}-${car.year || i}`}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <div
                    style={{
                      flex: "1 1 0",
                      minWidth: 0,
                      paddingRight: 24,
                      textAlign: "center",
                    }}
                  >
                    <motion.div variants={textVariantsV}>
                      {car.year ? (
                        <span
                          style={{
                            display: "block",
                            fontFamily: "var(--rl)",
                            fontSize: 10,
                            letterSpacing: "0.3em",
                            color: isHighlighted
                              ? "#f5e6b8"
                              : "rgba(201,168,76,0.75)",
                            fontFeatureSettings: "'tnum' 1",
                            marginBottom: 3,
                          }}
                        >
                          {car.year}
                        </span>
                      ) : null}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--pd)",
                            fontSize: isHighlighted
                              ? "clamp(16px,4vw,19px)"
                              : "clamp(14px,3.6vw,17px)",
                            fontWeight: isHighlighted ? 700 : 400,
                            lineHeight: 1.25,
                            color: isHighlighted ? "#f5e6b8" : "var(--ivory)",
                            whiteSpace: isRollsRoyce ? "nowrap" : "normal",
                          }}
                        >
                          {car.brand}
                        </span>
                        {car.model ? (
                          <span
                            style={{
                              marginTop: 1,
                              fontFamily: "var(--pd)",
                              fontSize: isPhantomI
                                ? "clamp(13px,3.3vw,16px)"
                                : "clamp(14px,3.6vw,17px)",
                              fontWeight: isHighlighted ? 700 : 400,
                              lineHeight: 1.25,
                              color: "rgba(245,240,232,0.55)",
                              whiteSpace: isPhantomI ? "nowrap" : "normal",
                            }}
                          >
                            {car.model}
                          </span>
                        ) : null}
                      </div>
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
                        diamondRefs.current[i] = el;
                      }}
                      data-base-transform="rotate(45deg)"
                      aria-hidden="true"
                      style={{
                        width: isHighlighted ? 11 : 8,
                        height: isHighlighted ? 11 : 8,
                        border: isHighlighted
                          ? "1.5px solid #f5e6b8"
                          : "1.5px solid #c9a84c",
                        background: "#0d1f17",
                        boxShadow: isHighlighted
                          ? "0 0 10px 2px rgba(245,230,184,0.45)"
                          : undefined,
                        transform: "rotate(45deg)",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: 36,
                      flexShrink: 0,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      ref={(el) => {
                        modernDiamondRefs.current[i] = el;
                      }}
                      data-base-transform="rotate(45deg)"
                      aria-hidden="true"
                      style={{
                        width: 8,
                        height: 8,
                        border: "1.5px solid #c9a84c",
                        background: "#0d1f17",
                        transform: "rotate(45deg)",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      flex: "1 1 0",
                      minWidth: 0,
                      textAlign: "center",
                    }}
                  >
                    <motion.div variants={textVariantsV}>
                      <span
                        style={{
                          display: "block",
                          marginBottom: 3,
                          fontFamily: "var(--rl)",
                          fontSize: 10,
                          letterSpacing: "0.3em",
                          color: "rgba(201,168,76,0.75)",
                          fontFeatureSettings: "'tnum' 1",
                        }}
                      >
                        {car.modernYear}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontFamily: "var(--pd)",
                          fontSize: "clamp(14px,3.6vw,17px)",
                          fontWeight: 400,
                          lineHeight: 1.25,
                          color: "var(--ivory)",
                        }}
                      >
                        {car.modernBrand}
                      </span>
                      {car.modernModel ? (
                        <span
                          style={{
                            display: "block",
                            marginTop: 1,
                            fontFamily: "var(--pd)",
                            fontSize: "clamp(14px,3.6vw,17px)",
                            fontWeight: 400,
                            lineHeight: 1.25,
                            color: "rgba(245,240,232,0.55)",
                          }}
                        >
                          {car.modernModel}
                        </span>
                      ) : null}
                    </motion.div>
                  </div>
                </div>
              );
            })(),
          )}
        </motion.div>
      </div>
    );
  }

  const SVG_H = BOTTOM_Y + 20;

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
            <div style={{ height: MARKER_ROW_H }} />
            <div style={{ height: MARKER_SPACER_H }} />
            <div
              style={{
                height: MARKER_ROW_H,
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--rl)",
                  fontSize: 10,
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  color: "rgba(201,168,76,0.75)",
                  marginTop: "25px",
                }}
              >
                Contemporan
              </span>
            </div>
          </div>

          {CARS.map((car, i) =>
            (() => {
              const isHighlighted =
                car.brand === "Lamborghini" &&
                car.model === "Centenario Tractor";
              const isPhantomI =
                car.brand === "Rolls-Royce" && car.model === "Phantom I";
              return (
                <div
                  key={`${car.brand}-${car.year || i}`}
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
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      paddingBottom: "10px",
                    }}
                  >
                    <motion.span
                      variants={textVariants}
                      style={{
                        fontFamily: "var(--pd)",
                        fontSize: isHighlighted
                          ? "clamp(17px,1.7vw,22px)"
                          : isPhantomI
                            ? "clamp(15px,1.35vw,18px)"
                            : "clamp(16px,1.5vw,20px)",
                        fontWeight: isHighlighted ? 700 : 400,
                        lineHeight: 1.3,
                        color: isHighlighted ? "#f5e6b8" : "var(--ivory)",
                        whiteSpace: isPhantomI && !tablet ? "nowrap" : "normal",
                      }}
                    >
                      {isPhantomI && !tablet ? (
                        <>
                          <span style={{ color: "var(--ivory)" }}>
                            Rolls-Royce
                          </span>
                          <span style={{ color: "rgba(245,240,232,0.6)" }}>
                            &nbsp;Phantom I
                          </span>
                        </>
                      ) : isPhantomI && tablet ? (
                        <>
                          <span style={{ color: "var(--ivory)" }}>
                            Rolls-Royce
                          </span>
                          <br />
                          <span style={{ color: "rgba(245,240,232,0.6)" }}>
                            Phantom I
                          </span>
                        </>
                      ) : (
                        <>
                          {car.brand}
                          {car.model ? (
                            <span style={{ color: "rgba(245,240,232,0.6)" }}>
                              {" "}
                              {car.model}
                            </span>
                          ) : null}
                        </>
                      )}
                    </motion.span>
                    <motion.span
                      variants={textVariants}
                      style={{
                        marginTop: 3,
                        fontFamily: "var(--rl)",
                        fontSize: 10,
                        letterSpacing: "0.35em",
                        color: isHighlighted
                          ? "#f5e6b8"
                          : "rgba(201,168,76,0.85)",
                        fontFeatureSettings: "'tnum' 1",
                      }}
                    >
                      {car.year || "\u00A0"}
                    </motion.span>
                  </div>
                  <div
                    style={{
                      height: MARKER_ROW_H,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      ref={(el) => {
                        diamondRefs.current[i] = el;
                      }}
                      data-base-transform="rotate(45deg)"
                      aria-hidden="true"
                      style={{
                        width: isHighlighted ? 11 : 8,
                        height: isHighlighted ? 11 : 8,
                        border: isHighlighted
                          ? "1.5px solid #f5e6b8"
                          : "1.5px solid #c9a84c",
                        background: "#0d1f17",
                        boxShadow: isHighlighted
                          ? "0 0 10px 2px rgba(245,230,184,0.45)"
                          : undefined,
                        transform: "rotate(45deg)",
                      }}
                    />
                  </div>
                  <div style={{ height: MARKER_SPACER_H }} />
                  <div
                    style={{
                      height: MARKER_ROW_H,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      ref={(el) => {
                        modernDiamondRefs.current[i] = el;
                      }}
                      data-base-transform="rotate(45deg)"
                      aria-hidden="true"
                      style={{
                        width: 8,
                        height: 8,
                        border: "1.5px solid #c9a84c",
                        background: "#0d1f17",
                        boxShadow: undefined,
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
                        display: "block",
                        fontFamily: "var(--rl)",
                        fontSize: 10,
                        letterSpacing: "0.35em",
                        color: "rgba(201,168,76,0.85)",
                        fontFeatureSettings: "'tnum' 1",
                      }}
                    >
                      {car.modernYear}
                    </motion.span>
                    <motion.span
                      variants={textVariants}
                      style={{
                        display: "block",
                        marginTop: 2,
                        fontFamily: "var(--pd)",
                        fontSize: "clamp(16px,1.5vw,20px)",
                        fontWeight: 400,
                        lineHeight: 1.3,
                        color: "var(--ivory)",
                      }}
                    >
                      {car.modernBrand}
                      {car.modernModel ? (
                        <span style={{ color: "rgba(245,240,232,0.6)" }}>
                          {" "}
                          {car.modernModel}
                        </span>
                      ) : null}
                    </motion.span>
                  </div>
                </div>
              );
            })(),
          )}
        </motion.div>
      </div>
    </div>
  );
}
