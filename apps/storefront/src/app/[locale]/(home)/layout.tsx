import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { setRequestLocaleValue } from "@lib/util/request-locale"
import Nav from "@modules/layout/templates/nav"
import CartPersonalization from "@modules/layout/components/cart-personalization"
import AppointmentWidget from "@modules/layout/components/appointment-widget"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function HomeLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  // See (main)/layout.tsx — Next may render this segment concurrently with
  // the root [locale]/layout.tsx, so re-seed the locale from this segment's
  // own params before Nav's data fetching runs.
  const { locale } = await props.params
  setRequestLocaleValue(locale)

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <CartPersonalization />
      <AppointmentWidget transparent hideOnTop />
      <div className="flex-1">{props.children}</div>
      {/* Footer is rendered inside HunterLanding (HomepageFooter) */}
    </div>
  )
}
