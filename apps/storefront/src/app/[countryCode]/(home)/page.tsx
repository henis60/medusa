import { Metadata } from "next"

import HunterLanding from "@modules/home/components/hunter-landing"
import ShopCollection from "@modules/home/components/hunter-landing/sections/ShopCollection"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "The Hunter House — Return of the Elegant Gentleman",
  description:
    "Tailoring premium, The Hunter Bar și o comunitate exclusivă, reunite într-un spațiu unic în România.",
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)

  const shopSlot = region ? <ShopCollection region={region} /> : null

  return <HunterLanding shopSlot={shopSlot} />
}
