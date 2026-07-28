import { retrieveOrder } from "@lib/data/orders"
import { retrieveCustomer } from "@lib/data/customer"
import { orderIdFromSlug } from "@lib/util/order-slug"
import OrderDetailsTemplate from "@modules/order/templates/order-details-template"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import OrderSummary from "@modules/order/components/order-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })
  return {
    title: t("Comandă confirmată"),
    description: t("Comanda ta a fost plasată cu succes"),
  }
}

// Fetched by the order's internal id, not display_id — that endpoint needs
// no customer login, so this page works right after guest checkout too, not
// just for logged-in customers browsing their own history. The URL itself
// shows the id without its "order_" prefix (orderIdFromSlug restores it) —
// purely cosmetic, doesn't change that the id is still opaque/unguessable.
export default async function ComandaPage(props: Props) {
  const params = await props.params
  const order = await retrieveOrder(orderIdFromSlug(params.id)).catch(() => null)

  if (!order) {
    return notFound()
  }

  // Invoice download requires the viewer to be the order's own customer —
  // right after guest checkout (this page's whole reason for existing),
  // there's no logged-in customer at all, so hide the button rather than
  // show it and fail on click.
  const customer = await retrieveCustomer()
  const canDownloadInvoice = !!customer && customer.id === order.customer_id

  return (
    <div className="page-container max-w-3xl py-3 small:py-10">
      <OrderDetailsTemplate
        order={order}
        standalone
        canDownloadInvoice={canDownloadInvoice}
        itemsSlot={<Items order={order} />}
        orderDetailsSlot={<OrderDetails order={order} showStatus />}
        shippingDetailsSlot={<ShippingDetails order={order} />}
        orderSummarySlot={<OrderSummary order={order} />}
      />
    </div>
  )
}
