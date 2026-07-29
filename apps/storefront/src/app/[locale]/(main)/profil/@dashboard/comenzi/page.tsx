import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account")
  return {
    title: t("Comenzi"),
    description: t("Istoricul comenzilor tale"),
  }
}

export default async function Orders() {
  const t = await getTranslations("account")
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      {/* Page header */}
      <div className="small:px-8 pt-8 pb-6 hidden small:block">
        <h1 className="font-display text-[32px] leading-[1] text-[var(--theme-text)]">
          {t("Comenzi")}
        </h1>
      </div>

      <OrderOverview orders={orders} />
    </div>
  )
}
