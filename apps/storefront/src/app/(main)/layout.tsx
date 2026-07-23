import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import CartPersonalization from "@modules/layout/components/cart-personalization"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import AppointmentWidget from "@modules/layout/components/appointment-widget"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function PageLayout(props: { children: React.ReactNode }) {
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
