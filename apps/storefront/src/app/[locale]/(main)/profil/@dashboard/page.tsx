import Overview from "@modules/account/components/overview"
import { redirect } from "@i18n/navigation"
import { getLocale } from "next-intl/server"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { getNewsletterSubscription } from "@lib/data/newsletter"

export default async function OverviewTemplate() {
  const customer = await retrieveCustomer().catch(() => null)

  // Signed out — send them to /profil itself (renders the login form via
  // profil/layout.tsx) rather than a dead-end 404.
  if (!customer) {
    redirect({ href: "/profil", locale: await getLocale() })
  }

  const [orders, newsletterSubscribed] = await Promise.all([
    listOrders().catch(() => null),
    getNewsletterSubscription(customer.email),
  ])

  return (
    <Overview
      customer={customer}
      orders={orders || null}
      newsletterSubscribed={newsletterSubscribed}
    />
  )
}
