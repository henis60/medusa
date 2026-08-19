export default function BileteNavLink() {
  return (
    <a
      href="https://www.iabilet.ro"
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
          <path d="M20.5 8.5 15.5 3.5a1.5 1.5 0 0 0-2.12 0l-9.88 9.88a1.5 1.5 0 0 0 0 2.12l5 5a1.5 1.5 0 0 0 2.12 0l9.88-9.88a1.5 1.5 0 0 0 0-2.12Z" />
          <circle cx="15" cy="9" r="1.2" fill="currentColor" stroke="none" />
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
