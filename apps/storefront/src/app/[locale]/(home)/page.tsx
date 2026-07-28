import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import HunterLanding from "@modules/home/components/hunter-landing"
import ShopCollection from "@modules/home/components/hunter-landing/sections/ShopCollection"
import { getRegionStatic } from "@lib/data/regions"
import { setRequestLocaleValue } from "@lib/util/request-locale"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })
  return {
    title: t("The Hunter House — Return of the Elegant Gentleman"),
    description: t("Tailoring premium, The Hunter Bar și o comunitate exclusivă, reunite într-un spațiu unic în România"
    ),
  }
}

// Static + ISR: the homepage reads no cookies (personalization is
// client-side), so it's served as cached HTML with no backend hit.
export const revalidate = 3600

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  // Next may render this page concurrently with its ancestor layouts, so
  // re-seed from this segment's own params before ShopCollection fetches —
  // see (main)/layout.tsx.
  const { locale } = await params
  setRequestLocaleValue(locale)

  const region = await getRegionStatic("ro")
  // Rendered inline (not behind Suspense) so the shop section is part of
  // the same cached HTML as the rest of the page — a Suspense fallback of
  // null here just meant this section popped in after hydration on every
  // visit, since ISR already resolves the data at regen time, not per-request.
  const shopSlot = region ? <ShopCollection region={region} /> : null
  return <HunterLanding shopSlot={shopSlot} />
}
