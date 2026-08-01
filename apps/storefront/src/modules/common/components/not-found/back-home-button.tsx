"use client"

import { useRouter } from "next/navigation"

// Plain next/navigation's useRouter (not @i18n/navigation's) — this
// component is also rendered from the true root not-found.tsx, outside the
// [locale] layout tree, where there's no NextIntlClientProvider for
// next-intl's own Link/useRouter to read locale context from. router.push
// works regardless, since localePrefix "never" means no locale prefix ever
// needs to be added to the href anyway.
export default function BackHomeButton({ label }: { label: string }) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      className="mt-2 px-6 py-3 font-sans text-[10px] uppercase tracking-[4px] border border-hunter-gold text-hunter-gold hover:bg-hunter-gold hover:text-hunter-dark transition-colors"
    >
      {label}
    </button>
  )
}
