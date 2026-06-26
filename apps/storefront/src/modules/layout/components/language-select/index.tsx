"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"

import { clx } from "@modules/common/components/ui"
import { updateLocale } from "@lib/data/locale-actions"
import { Locale } from "@lib/data/locales"

type LanguageSelectProps = {
  locales: Locale[]
  currentLocale: string | null
}

const LanguageSelect = ({ locales, currentLocale }: LanguageSelectProps) => {
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
    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
      <span>Limbă</span>
      <div className="flex items-center gap-3">
        {locales.map((l) => (
          <button
            key={l.code}
            onClick={() => handleChange(l.code)}
            disabled={isPending}
            className={clx(
              "transition-colors disabled:opacity-60",
              active === l.code.toLowerCase()
                ? "text-hunter-gold"
                : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
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
