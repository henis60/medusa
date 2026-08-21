import { montigny } from "./fonts"

export default function SiteHeader({
  homeHref = "/",
  showMeridianSuffix = false,
  ctaHref,
  ctaLabel,
}: {
  homeHref?: string
  showMeridianSuffix?: boolean
  ctaHref: string
  ctaLabel: string
}) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 var(--pad)",
        background: "rgba(11,18,14,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(201,168,76,0.14)",
      }}
    >
      <a
        href={homeHref}
        style={{
          fontFamily: "var(--pd)",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--ivory)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "baseline",
          gap: 6,
        }}
      >
        The Hunter
        {showMeridianSuffix ? (
          <em
            className={montigny.className}
            style={{
              fontStyle: "normal",
              fontWeight: 500,
              textTransform: "none",
              color: "var(--gold)",
              fontSize: 24,
            }}
          >
            Meridian
          </em>
        ) : null}
      </a>
      <a
        href={ctaHref}
        target={ctaHref.startsWith("http") ? "_blank" : undefined}
        rel={ctaHref.startsWith("http") ? "noopener" : undefined}
        style={{
          display: "inline-flex",
          alignItems: "center",
          height: 36,
          padding: "0 20px",
          border: "1px solid rgba(201,168,76,0.45)",
          fontFamily: "var(--rl)",
          fontSize: 9,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(232,213,163,0.85)",
          textDecoration: "none",
          transition: "border-color .3s, background .3s, color .3s",
        }}
      >
        {ctaLabel}
      </a>
    </header>
  )
}
