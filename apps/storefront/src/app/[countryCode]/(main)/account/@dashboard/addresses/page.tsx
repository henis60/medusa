import { Metadata } from "next"
import { notFound } from "next/navigation"

import AddressBook from "@modules/account/components/address-book"
import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Addresses",
  description: "View your addresses",
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="small:px-8 pt-8 pb-6">
        <h1 className="font-display text-[32px] leading-[1] text-[var(--theme-text)]">
          Addresses
        </h1>
      </div>
      <div className="small:px-8 py-8">
        <AddressBook customer={customer} region={region} />
      </div>
    </div>
  )
}
