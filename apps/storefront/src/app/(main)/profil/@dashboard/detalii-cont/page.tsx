import { Metadata } from "next"

import ProfileDetails from "@modules/account/components/profile-details"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Detalii cont",
  description: "Vizualizează și editează detaliile contului tău.",
}

export default async function Profile() {
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="profile-page-wrapper">
      {/* Page header */}
      <div className="small:px-8 pt-8 pb-6 hidden small:block">
        <h1 className="font-display text-[32px] leading-[1] text-[var(--theme-text)]">
          Detalii cont
        </h1>
      </div>

      <div className="small:px-8">
        <ProfileDetails customer={customer} />
      </div>
    </div>
  )
}
