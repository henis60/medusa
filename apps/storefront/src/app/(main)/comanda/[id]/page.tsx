import { retrieveOrder } from "@lib/data/orders"
import OrderDetailsTemplate from "@modules/order/templates/order-details-template"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Comandă confirmată",
  description: "Comanda ta a fost plasată cu succes.",
}

// Fetched by the order's internal id, not display_id — that endpoint needs
// no customer login, so this page works right after guest checkout too, not
// just for logged-in customers browsing their own history.
export default async function ComandaPage(props: Props) {
  const params = await props.params
  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    return notFound()
  }

  return (
    <div className="page-container max-w-3xl py-6 small:py-10">
      <OrderDetailsTemplate order={order} standalone />
    </div>
  )
}
