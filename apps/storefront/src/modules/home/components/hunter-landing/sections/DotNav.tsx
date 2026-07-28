"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"

const SECTION_IDS = [
  "home",
  "about",
  "shop",
  "collections",
  "space",
  "events",
  "bar",
  "giftcard",
  "membership",
  "subscribe",
  "contact",
] as const

export default function DotNav() {
  const t = useTranslations("home")
  const [active, setActive] = useState<(typeof SECTION_IDS)[number]>("home")

  const SECTIONS = SECTION_IDS.map((section) => ({
    label: t(section),
    section,
  }))

  useEffect(() => {
    function update() {
      const mid = window.innerHeight * 0.5
      const atBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 8
      let current: (typeof SECTION_IDS)[number] = SECTION_IDS[0]
      SECTION_IDS.forEach((section) => {
        const el = document.getElementById(section)
        if (!el) return
        if (el.getBoundingClientRect().top <= mid) current = section
      })
      if (atBottom) current = SECTION_IDS[SECTION_IDS.length - 1]
      setActive(current)
    }
    window.addEventListener("scroll", update, { passive: true })
    update()
    return () => window.removeEventListener("scroll", update)
  }, [])

  return (
    <nav className="dot-nav" id="dotNav" aria-label={t("Navigare secțiuni")}>
      {SECTIONS.map((item) => (
        <a
          key={item.section}
          href={`#${item.section}`}
          data-label={item.label}
          data-section={item.section}
          aria-label={item.label}
          className={active === item.section ? "active" : ""}
          onClick={(e) => {
            e.preventDefault()
            document
              .getElementById(item.section)
              ?.scrollIntoView({ behavior: "smooth" })
          }}
        ></a>
      ))}
    </nav>
  )
}
