import { retrieveOrderByDisplayId } from "@lib/data/orders"
import OrderDetailsTemplate from "@modules/order/templates/order-details-template"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ displayId: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { displayId } = await props.params

  return {
    title: `Comanda #${displayId}`,
    description: "Detaliile comenzii tale.",
  }
}

export default async function OrderDetailPage(props: Props) {
  const { displayId } = await props.params
  const order = await retrieveOrderByDisplayId(displayId).catch(() => null)

  if (!order) {
    notFound()
  }

  return <OrderDetailsTemplate order={order} />
}
