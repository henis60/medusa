"use client"

import { Button } from "@modules/common/components/ui"

import OrderCard from "../order-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <div className="w-full small:px-8 py-4">
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
          Istoric comenzi
        </p>
        <h2 className="font-display text-[28px] leading-[1.1] text-[var(--theme-text)] mb-3">
          Nicio comandă încă
        </h2>
        <p className="font-serif italic text-[14px] text-[var(--theme-text-muted)] max-w-[240px] mx-auto">
          Descoperă colecția noastră și plasează prima ta comandă.
        </p>
      </div>
      <LocalizedClientLink href="/store" passHref>
        <Button
          data-testid="continue-shopping-button"
          className="h-12 small:px-8 rounded-none !bg-hunter-gold !text-hunter-dark !border-transparent font-sans uppercase tracking-[3px] text-[11px]"
        >
          Vezi colecția
        </Button>
      </LocalizedClientLink>
    </div>
  )
}

export default OrderOverview
