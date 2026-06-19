import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Help = () => {
  return (
    <div className="px-4 small:px-8 py-6">
      <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-4">
        Need help?
      </p>
      <div className="flex gap-6">
        <LocalizedClientLink
          href="/contact"
          className="font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-current pb-0.5"
        >
          Contact Us
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/contact"
          className="font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-current pb-0.5"
        >
          Returns & Exchanges
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Help
