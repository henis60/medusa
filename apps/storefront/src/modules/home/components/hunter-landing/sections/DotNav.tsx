"use client"

import { useState, useEffect } from "react"

const SECTIONS = [
  { label: "Intro", section: "home" },
  { label: "Origin", section: "about" },
  { label: "The Shop", section: "shop" },
  { label: "Collections", section: "collections" },
  { label: "The House", section: "space" },
  { label: "Events", section: "events" },
  { label: "The Bar", section: "bar" },
  { label: "Gift Card", section: "giftcard" },
  { label: "Membership", section: "membership" },
  { label: "Newsletter", section: "subscribe" },
  { label: "Contact", section: "contact" },
]

export default function DotNav() {
  const [active, setActive] = useState("home")

  useEffect(() => {
    function update() {
      const mid = window.innerHeight * 0.5
      const atBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 8
      let current = SECTIONS[0].section
      SECTIONS.forEach(({ section }) => {
        const el = document.getElementById(section)
        if (!el) return
        if (el.getBoundingClientRect().top <= mid) current = section
      })
      if (atBottom) current = SECTIONS[SECTIONS.length - 1].section
      setActive(current)
    }
    window.addEventListener("scroll", update, { passive: true })
    update()
    return () => window.removeEventListener("scroll", update)
  }, [])

  return (
    <nav className="dot-nav" id="dotNav" aria-label="Navigare secțiuni">
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
