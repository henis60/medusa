export default function BileteNavLink() {
  return (
    <a href="#bilete" aria-label="Bilete" className="h-full flex items-center">
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
          <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.5 1.5 0 0 0 0-3Z" />
          <line x1="10" y1="7.5" x2="10" y2="16.5" strokeDasharray="1.6 2.2" />
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
