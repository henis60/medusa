export default function BileteNavLink() {
  return (
    <a
      href="https://www.iabilet.ro/bilete-baia-mare-the-hunter-meridian-130573"
      target="_blank"
      rel="noopener"
      aria-label="Bilete"
      className="h-full flex items-center"
    >
      {/* Mobile: icon only */}
      <span className="flex small:hidden items-center justify-center text-white hover:opacity-60 transition-opacity">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 8a1.5 1.5 0 0 1 1.5-1.5h15A1.5 1.5 0 0 1 21 8v1.25a1.25 1.25 0 0 0 0 2.5V13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 13v-1.25a1.25 1.25 0 0 0 0-2.5Z" />
          <line x1="14.5" y1="7" x2="14.5" y2="14.5" strokeDasharray="1.4 1.8" />
        </svg>
      </span>

      {/* Desktop: bordered pill button, matching the page's other gold CTAs */}
      <span
        className="thm-btn-outline hidden small:inline-flex items-center"
        style={{
          border: "1px solid rgba(255,255,255,0.45)",
          padding: "10px 22px",
          color: "rgba(255,255,255,0.85)",
          fontFamily: "var(--rl)",
          fontSize: 10,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          transition: "border-color .3s, background .3s, color .3s",
        }}
      >
        Bilete
      </span>
    </a>
  )
}
