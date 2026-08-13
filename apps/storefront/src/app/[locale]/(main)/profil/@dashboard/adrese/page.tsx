import { Metadata } from "next"
import { notFound } from "next/navigation"
import { redirect } from "@i18n/navigation"
import { getTranslations, getLocale } from "next-intl/server"

import AddressBook from "@modules/account/components/address-book"
import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account")
  return {
    title: t("Adrese salvate"),
    description: t("Adresele tale salvate"),
  }
}

export default async function Addresses() {
  const t = await getTranslations("account")
  const customer = await retrieveCustomer()

  // Signed out — send them to /profil itself (renders the login form via
  // profil/layout.tsx) rather than a dead-end 404.
  if (!customer) {
    redirect({ href: "/profil", locale: await getLocale() })
    // `redirect` throws, so this is unreachable — it is here so the compiler
    // can narrow `customer` to non-null for the render below.
    return null
  }

  const region = await getRegion("ro")
  if (!region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="small:px-8 pt-8 pb-6 hidden small:block">
        <h1 className="font-display text-[32px] leading-[1] text-[var(--theme-text)]">
          {t("Adrese salvate")}
        </h1>
      </div>
      <div className="small:px-8 py-8">
        <AddressBook customer={customer} region={region} />
      </div>
    </div>
  )
}

