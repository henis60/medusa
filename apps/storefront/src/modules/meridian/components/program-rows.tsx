"use client"

import { motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import { useEffect, useState } from "react"

const ROWS = [
  {
    kicker: "Expoziție auto",
    title: "Automobile ",
    titleEm: "de colecție",
    body: "Zece automobile de excepție, expuse în perechi clasic-contemporan. Piesa centrală: Lamborghini Centenario Tractor.",
    src: "/meridian/thm-program-1.webp",
    objectPositionY: "51%",
  },
  {
    kicker: "Concert live",
    title: "Gray Bliss Band și ",
    titleEm: "invitatul special Mihail",
    body: "Concert Jazz & Blues susținut de Gray Bliss Band din Cluj-Napoca și de invitatul special Mihail.",
    src: "/meridian/thm-program-2.webp",
    objectPositionY: "51%",
  },
  // { kicker: "Artă vizuală" } row — temporarily disabled.
  // {
  //   kicker: "Artă vizuală",
  //   title: "Pictură și ",
  //   titleEm: "sculptură",
  //   body: "Colonia Pictorilor este o locație cu tradiție în artă. Lucrările sunt integrate în parcursul evenimentului nostru.",
  //   src: "/meridian/thm-program-3.webp",
  //   objectPositionY: "50%",
  // },
  {
    kicker: "Colecțiile noi",
    title: "Prezentarea ținutelor",
    titleEm: "",
    body: "Trei colecții prezentate în premieră: vânătoare, echitație și lifestyle feminin.",
    src: "/meridian/thm-program-4.webp",
    objectPositionY: "20%",
  },
]

const COLLAPSED_MOBILE = { minHeight: "130px", padding: "20px var(--pad)" }
const EXPANDED_MOBILE = { minHeight: "280px", padding: "32px var(--pad)" }
const COLLAPSED_DESKTOP = { minHeight: "240px", padding: "28px var(--pad)" }
const EXPANDED_DESKTOP = { minHeight: "420px", padding: "44px var(--pad)" }

export default function ProgramRows() {
  const reduceMotion = useReducedMotion()
  // Touch devices have no hover, so rows expand as they scroll into view
  // instead — whileHover never fires there.
  const [hoverCapable, setHoverCapable] = useState(true)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    // (hover: hover) reflects only the PRIMARY input — on touchscreen
    // laptops that reports false even with a mouse/trackpad attached,
    // wrongly switching desktop users to the scroll-triggered mobile
    // behavior. (any-hover: hover) checks every available input instead.
    setHoverCapable(window.matchMedia("(any-hover: hover)").matches)
    const mq = window.matchMedia("(min-width: 861px)")
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const COLLAPSED = isDesktop ? COLLAPSED_DESKTOP : COLLAPSED_MOBILE
  const EXPANDED = isDesktop ? EXPANDED_DESKTOP : EXPANDED_MOBILE

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {ROWS.map((row, i) => (
        <motion.div
          key={row.kicker}
          initial={COLLAPSED}
          whileHover={hoverCapable ? EXPANDED : undefined}
          whileInView={!hoverCapable ? EXPANDED : undefined}
          viewport={{ amount: 0.55, once: true }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }
          }
          style={{
            position: "relative",
            display: "flex",
            flexShrink: 0,
            alignItems: "center",
            gap: 32,
            overflow: "hidden",
            boxSizing: "border-box",
            borderBottom:
              i < ROWS.length - 1
                ? "1px solid rgba(201,168,76,0.16)"
                : undefined,
          }}
        >
          <Image
            src={row.src}
            alt=""
            fill
            sizes="100vw"
            className={
              row.kicker === "Colecțiile noi"
                ? "thm-program-img-collections"
                : undefined
            }
            style={{
              objectFit: "cover",
              objectPosition: `50% ${row.objectPositionY}`,
              zIndex: 0,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background:
                "linear-gradient(90deg, rgba(13,31,23,0.92) 0%, rgba(13,31,23,0.75) 45%, rgba(13,31,23,0.35) 100%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              maxWidth: 1360,
              margin: "0 auto",
            }}
          >
            <div style={{ maxWidth: "52ch" }}>
              <p
                style={{
                  fontFamily: "var(--rl)",
                  fontSize: 9,
                  letterSpacing: "0.5em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  margin: 0,
                }}
              >
                {row.kicker}
              </p>
              <p
                style={{
                  fontFamily: "var(--pd)",
                  fontSize: "clamp(22px,2.4vw,30px)",
                  fontWeight: 400,
                  lineHeight: 1.15,
                  color: "var(--ivory)",
                  margin: "10px 0 0",
                }}
              >
                {row.title}
                {row.titleEm ? (
                  <em style={{ fontStyle: "italic", color: "#c9a84c" }}>
                    {row.titleEm}
                  </em>
                ) : null}
              </p>
              <p
                style={{
                  fontFamily: "var(--cg)",
                  fontSize: 16,
                  fontStyle: "italic",
                  fontWeight: 300,
                  lineHeight: 1.7,
                  color: "rgba(245,240,232,0.85)",
                  margin: "14px 0 0",
                }}
              >
                {row.body}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
