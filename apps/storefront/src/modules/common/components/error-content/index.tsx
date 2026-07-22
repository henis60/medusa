"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ErrorContentProps = {
  title?: string
  description?: string
  reset?: () => void
  homeHref?: string
  homeLabel?: string
}

const ErrorContent = ({
  title = "A apărut o eroare",
  description = "Ceva nu a funcționat cum trebuie. Poți reîncerca sau te poți întoarce la pagina principală.",
  reset,
  homeHref = "/",
  homeLabel = "Înapoi la pagina principală",
}: ErrorContentProps) => {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-6 gap-4"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <h1
        className="font-display text-[32px] leading-[1]"
        style={{ color: "var(--theme-text)" }}
      >
        {title}
      </h1>
      <p
        className="font-sans text-sm max-w-sm"
        style={{ color: "var(--theme-text-muted)" }}
      >
        {description}
      </p>
      <div className="flex items-center gap-4 mt-2">
        {reset && (
          <button
            onClick={reset}
            className="px-6 py-3 font-sans text-[10px] uppercase tracking-[4px] bg-hunter-gold text-hunter-dark hover:opacity-90 transition-opacity"
          >
            Reîncearcă
          </button>
        )}
        <LocalizedClientLink
          href={homeHref}
          className="px-6 py-3 font-sans text-[10px] uppercase tracking-[4px] border border-hunter-gold text-hunter-gold hover:bg-hunter-gold hover:text-hunter-dark transition-colors"
        >
          {homeLabel}
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default ErrorContent
