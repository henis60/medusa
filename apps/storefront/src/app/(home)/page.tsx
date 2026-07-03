import { Suspense } from "react"
import { Metadata } from "next"

import HunterLanding from "@modules/home/components/hunter-landing"
import ShopCollection from "@modules/home/components/hunter-landing/sections/ShopCollection"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "The Hunter House — Return of the Elegant Gentleman",
  description:
    "Tailoring premium, The Hunter Bar și o comunitate exclusivă, reunite într-un spațiu unic în România.",
}

// Static + ISR: the homepage reads no cookies (personalization is
// client-side), so it's served as cached HTML with no backend hit.
export const revalidate = 3600

export default async function Home() {
  const region = await getRegion("ro")
  // Suspense lets the hero stream immediately; the shop section (2 API
  // calls: collections → products) pops in when ready.
  const shopSlot = region ? (
    <Suspense fallback={null}>
      <ShopCollection region={region} />
    </Suspense>
  ) : null
  return <HunterLanding shopSlot={shopSlot} />
}
