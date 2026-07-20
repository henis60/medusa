import { Metadata } from "next"

import HunterLanding from "@modules/home/components/hunter-landing"
import ShopCollection from "@modules/home/components/hunter-landing/sections/ShopCollection"
import { getRegionStatic } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "The Hunter House — Return of the Elegant Gentleman",
  description:
    "Tailoring premium, The Hunter Bar și o comunitate exclusivă, reunite într-un spațiu unic în România.",
}

// Static + ISR: the homepage reads no cookies (personalization is
// client-side), so it's served as cached HTML with no backend hit.
export const revalidate = 3600

export default async function Home() {
  const region = await getRegionStatic("ro")
  // Rendered inline (not behind Suspense) so the shop section is part of
  // the same cached HTML as the rest of the page — a Suspense fallback of
  // null here just meant this section popped in after hydration on every
  // visit, since ISR already resolves the data at regen time, not per-request.
  const shopSlot = region ? <ShopCollection region={region} /> : null
  return <HunterLanding shopSlot={shopSlot} />
}
