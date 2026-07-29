"use client"

import { useTranslations } from "next-intl"
import { usePathname } from "@i18n/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function AccountBackLink() {
  const t = useTranslations("account")
  const route = usePathname()

  if (route === "/account") return null

  return (
    <LocalizedClientLink
      href="/account"
      className="small:hidden font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors mt-4 mb-2 inline-block"
      data-testid="account-back-link"
    >
      {t("← Înapoi la profil")}
    </LocalizedClientLink>
  )
}
