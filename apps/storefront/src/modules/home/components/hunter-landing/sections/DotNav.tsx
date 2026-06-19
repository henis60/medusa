"use client"

export default function DotNav() {
  const sections = [
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

  return (
    <nav className="dot-nav" id="dotNav" aria-label="Navigare secțiuni">
      {sections.map((item) => (
        <a
          key={item.section}
          href={`#${item.section}`}
          data-label={item.label}
          data-section={item.section}
          aria-label={item.label}
        ></a>
      ))}
    </nav>
  )
}
