import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import { setRequestLocaleValue } from "@lib/util/request-locale"
import CartPersonalization from "@modules/layout/components/cart-personalization"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import AppointmentWidget from "@modules/layout/components/appointment-widget"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  // Next.js may render sibling route-segment layouts (this one, the root
  // [locale]/layout.tsx) concurrently rather than strictly parent-then-child,
  // so the root layout's setRequestLocaleValue call isn't guaranteed to have
  // run yet by the time Nav's data fetching starts here. Every segment layout
  // gets the same params independently from Next's router, so re-seeding it
  // here (before Nav renders) makes this subtree's locale reliable on its own.
  const { locale } = await props.params
  setRequestLocaleValue(locale)

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <CartPersonalization />
      <AppointmentWidget />
      <div className="flex-1">{props.children}</div>
      <Footer />
    </div>
  )
}
