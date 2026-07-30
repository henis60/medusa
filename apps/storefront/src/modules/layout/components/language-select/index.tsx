"use client"

import { useTransition } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@i18n/navigation"

import { clx } from "@modules/common/components/ui"
import { updateLocale } from "@lib/data/locale-actions"
import { Locale } from "@lib/data/locales"

type LanguageSelectProps = {
  locales: Locale[]
  currentLocale: string | null
}

const LanguageSelect = ({ locales, currentLocale }: LanguageSelectProps) => {
  const t = useTranslations("layout")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const active = (currentLocale ?? "ro").toLowerCase()

  const handleChange = (code: string) => {
    if (code.toLowerCase() === active) return
    startTransition(async () => {
      await updateLocale(code)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-between font-sans text-[13px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
      <span>{t("Limbă")}</span>
      <div className="flex items-center border border-[var(--theme-border)]">
        {locales.map((l, i) => (
          <button
            key={l.code}
            onClick={() => handleChange(l.code)}
            disabled={isPending}
            className={clx(
              "px-3 py-0.5 font-sans text-[10px] uppercase tracking-[2px] transition-colors duration-150 disabled:opacity-60",
              i > 0 && "border-l border-[var(--theme-border)]",
              active === l.code.toLowerCase()
                ? "bg-hunter-gold text-hunter-dark"
                : "text-[var(--theme-text-muted)] hover:text-hunter-gold"
            )}
          >
            {l.code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

export default LanguageSelect
