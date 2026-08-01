import { retrieveOrderByDisplayId } from "@lib/data/orders"
import { retrieveCustomer } from "@lib/data/customer"
import OrderDetailsTemplate from "@modules/order/templates/order-details-template"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import OrderSummary from "@modules/order/components/order-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { redirect } from "@i18n/navigation"
import { getTranslations, getLocale } from "next-intl/server"

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

  // Signed out — send them to /profil itself (renders the login form via
  // profil/layout.tsx) rather than a dead-end 404. Previously this page had
  // no auth check at all: retrieveOrderByDisplayId's own listOrders() call
  // would throw on the backend's 401 (no auth headers), and the .catch(()
  // => null) below just swallowed that into notFound() instead of any kind
  // of redirect.
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) {
    redirect({ href: "/profil", locale: await getLocale() })
  }

  // Passed explicitly (not left to retrieveOrderByDisplayId's internal
  // fallback) because this page is almost always reached via client-side
  // navigation from /profil/comenzi under the same already-mounted
  // [locale]/layout.tsx — Next.js skips re-running that layout's function
  // body on a soft nav, so the cache() value it seeds never gets set for
  // this request, and the order would render in the base locale until a
  // hard refresh. next-intl's own getLocale() is populated per-request
  // regardless (used above for the redirect already).
  const locale = await getLocale()
  const order = await retrieveOrderByDisplayId(displayId, locale).catch(
    () => null
  )

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
