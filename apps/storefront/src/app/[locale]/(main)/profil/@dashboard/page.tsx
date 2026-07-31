import Overview from "@modules/account/components/overview"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { getNewsletterSubscription } from "@lib/data/newsletter"

export default async function OverviewTemplate() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    notFound()
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
