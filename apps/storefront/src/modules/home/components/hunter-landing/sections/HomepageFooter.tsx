import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function HomepageFooter() {
  return (
    <footer className="w-full bg-[#0D0D0D] border-t border-[rgba(201,168,76,0.15)]">
      <div
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3"
        style={{ padding: "12px clamp(20px, 6vw, 80px)" }}
      >
        <LocalizedClientLink
          href="/"
          className="font-display text-sm tracking-[0.12em] flex items-baseline gap-1.5"
        >
          <span className="text-[#E8D5A3] uppercase">The Hunter</span>
          <span className="italic text-hunter-gold uppercase">house</span>
        </LocalizedClientLink>

        <span className="hidden medium:inline font-serif italic text-xs text-hunter-gold/70">
          Return of the Elegant Gentleman
        </span>

        <span className="font-sans text-[9px] uppercase tracking-[3px] text-[rgba(232,213,163,0.4)]">
          © {new Date().getFullYear()} Toate drepturile rezervate
        </span>
      </div>
    </footer>
  )
}
