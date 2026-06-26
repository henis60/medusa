"use client"

import { usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function AccountBackLink() {
  const route = usePathname()

  if (route === "/account") return null

  return (
    <LocalizedClientLink
      href="/account"
      className="small:hidden font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors mt-4 mb-2 inline-block"
      data-testid="account-back-link"
    >
      ← Înapoi la profil
    </LocalizedClientLink>
  )
}
