import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import TransferRequestForm from "@modules/account/components/transfer-request-form"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      {/* Page header */}
      <div className="small:px-8 pt-8 pb-6">
        <h1 className="font-display text-[32px] leading-[1] text-[var(--theme-text)]">
          Orders
        </h1>
      </div>

      <OrderOverview orders={orders} />

      {/* Transfer section */}
      <div className="small:px-8 pt-8 pb-10 border-t border-[var(--theme-border)]">
        <TransferRequestForm />
      </div>
    </div>
  )
}
