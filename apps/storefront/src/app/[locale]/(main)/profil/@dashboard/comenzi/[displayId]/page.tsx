import { retrieveOrderByDisplayId } from "@lib/data/orders"
import OrderDetailsTemplate from "@modules/order/templates/order-details-template"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import OrderSummary from "@modules/order/components/order-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

type Props = {
  params: Promise<{ displayId: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { displayId } = await props.params
  const t = await getTranslations("account")

  return {
    title: t("Comanda #{displayId}", { displayId }),
    description: t("Detaliile comenzii tale"),
  }
}

export default async function OrderDetailPage(props: Props) {
  const { displayId } = await props.params
  const order = await retrieveOrderByDisplayId(displayId).catch(() => null)

  if (!order) {
    notFound()
  }

  return (
    <OrderDetailsTemplate
      order={order}
      itemsSlot={<Items order={order} />}
      orderDetailsSlot={<OrderDetails order={order} showStatus />}
      shippingDetailsSlot={<ShippingDetails order={order} />}
      orderSummarySlot={<OrderSummary order={order} />}
    />
  )
}
