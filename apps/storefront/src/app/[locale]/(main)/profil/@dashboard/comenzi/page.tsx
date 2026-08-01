import { Metadata } from "next"
import { getTranslations, getLocale } from "next-intl/server"

import OrderOverview from "@modules/account/components/order-overview"
import { redirect } from "@i18n/navigation"
import { retrieveCustomer } from "@lib/data/customer"
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

  // Signed out — send them to /profil itself (renders the login form via
  // profil/layout.tsx) rather than a dead-end 404. Previously this page had
  // no auth check at all: listOrders() would throw on the backend's 401
  // (no auth headers), surfacing as an unhandled 500 instead of any kind of
  // graceful redirect/404.
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) {
    redirect({ href: "/profil", locale: await getLocale() })
  }

  const orders = await listOrders()

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
