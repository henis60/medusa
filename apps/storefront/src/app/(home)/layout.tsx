import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import Nav from "@modules/layout/templates/nav"
import CartPersonalization from "@modules/layout/components/cart-personalization"
import AppointmentWidget from "@modules/layout/components/appointment-widget"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function HomeLayout(props: { children: React.ReactNode }) {
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
