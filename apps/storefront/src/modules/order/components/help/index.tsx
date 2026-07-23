import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Help = () => {
  return (
    <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] p-5 small:p-8 flex flex-col small:flex-row items-stretch small:items-center justify-between gap-5 small:gap-6">
      <div>
        <p className="font-display text-[20px] leading-[1.1] text-[var(--theme-text)] mb-1.5 small:mb-2">
          Ai nevoie de ajutor?
        </p>
        <p className="font-sans text-[12px] text-[var(--theme-text-muted)]">
          Echipa noastră îți stă la dispoziție pentru orice întrebare.
        </p>
      </div>
      <LocalizedClientLink
        href="/contact"
        className="shrink-0 h-11 px-6 inline-flex items-center justify-center border border-[var(--theme-border)] font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text)] hover:border-hunter-gold hover:text-hunter-gold active:border-hunter-gold active:text-hunter-gold transition-colors"
      >
        Contactează-ne
      </LocalizedClientLink>
    </div>
  )
}

export default Help
