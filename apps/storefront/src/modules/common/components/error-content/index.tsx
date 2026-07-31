"use client"

import { useTranslations } from "next-intl"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ErrorContentProps = {
  title?: string
  description?: string
  reset?: () => void
  homeHref?: string
  homeLabel?: string
}

const ErrorContent = ({
  title,
  description,
  reset,
  homeHref = "/",
  homeLabel,
}: ErrorContentProps) => {
  const t = useTranslations("common")
  const resolvedTitle = title ?? t("A apărut o eroare")
  const resolvedDescription =
    description ??
    t(
      "Ceva nu a funcționat cum trebuie Poți reîncerca sau te poți întoarce la pagina principală",
    )
  const resolvedHomeLabel = homeLabel ?? t("Înapoi la pagina principală")
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-6 gap-4"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <h1
        className="font-display text-[32px] leading-[1]"
        style={{ color: "var(--theme-text)" }}
      >
        {resolvedTitle}
      </h1>
      <p
        className="font-sans text-sm max-w-sm"
        style={{ color: "var(--theme-text-muted)" }}
      >
        {resolvedDescription}
      </p>
      <div className="flex flex-col small:flex-row items-stretch small:items-center justify-center gap-4 mt-2 w-full max-w-xs small:max-w-none">
        {reset && (
          <button
            onClick={reset}
            className="flex items-center justify-center min-h-[48px] px-6 py-3 font-sans text-[10px] uppercase tracking-[4px] bg-hunter-gold text-hunter-dark hover:opacity-90 transition-opacity"
          >
            {t("Reîncearcă")}
          </button>
        )}
        <LocalizedClientLink
          href={homeHref}
          className="flex items-center justify-center min-h-[48px] px-6 py-3 font-sans text-[10px] uppercase tracking-[4px] border border-hunter-gold text-hunter-gold hover:bg-hunter-gold hover:text-hunter-dark transition-colors"
        >
          {resolvedHomeLabel}
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default ErrorContent
