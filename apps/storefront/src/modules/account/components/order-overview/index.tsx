"use client"

import { Button } from "@modules/common/components/ui"

import OrderCard from "../order-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <div className="w-full small:px-8 py-6">
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-center gap-6 small:px-8 py-20 text-center"
      data-testid="no-orders-container"
    >
      <div>
        <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-3">
          Order History
        </p>
        <h2 className="font-display text-[28px] leading-[1.1] text-[var(--theme-text)] mb-3">
          No orders yet
        </h2>
        <p className="font-serif italic text-[14px] text-[var(--theme-text-muted)] max-w-[240px] mx-auto">
          Discover our curated collection and place your first order.
        </p>
      </div>
      <LocalizedClientLink href="/store" passHref>
        <Button
          data-testid="continue-shopping-button"
          className="h-12 small:px-8 rounded-none !bg-hunter-gold !text-hunter-dark !border-transparent font-sans uppercase tracking-[3px] text-[11px]"
        >
          Shop Now
        </Button>
      </LocalizedClientLink>
    </div>
  )
}

export default OrderOverview
