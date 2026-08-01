import { Metadata } from "next"
import { getTranslations, getLocale } from "next-intl/server"

import ProfileDetails from "@modules/account/components/profile-details"
import { redirect } from "@i18n/navigation"
import { retrieveCustomer } from "@lib/data/customer"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account")
  return {
    title: t("Detalii cont"),
    description: t("Vizualizează și editează detaliile contului tău"),
  }
}

export default async function Profile() {
  const t = await getTranslations("account")
  const customer = await retrieveCustomer()

  // Signed out — send them to /profil itself (renders the login form via
  // profil/layout.tsx) rather than a dead-end 404.
  if (!customer) {
    redirect({ href: "/profil", locale: await getLocale() })
  }

  return (
    <div className="w-full" data-testid="profile-page-wrapper">
      {/* Page header */}
      <div className="small:px-8 pt-8 pb-6 hidden small:block">
        <h1 className="font-display text-[32px] leading-[1] text-[var(--theme-text)]">
          {t("Detalii cont")}
        </h1>
      </div>

      <div className="small:px-8">
        <ProfileDetails customer={customer} />
      </div>
    </div>
  )
}
