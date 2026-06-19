"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import Help from "@modules/order/components/help"
import React from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({ order }) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-[var(--theme-border)] flex items-start justify-between gap-4">
        <div>
          <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-2">
            My Account
          </p>
          <h1 className="font-display text-[32px] leading-[1] text-[var(--theme-text)]">
            Order #{order.display_id}
          </h1>
        </div>
        <LocalizedClientLink
          href="/account/orders"
          className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-current pb-0.5 mt-2 shrink-0"
          data-testid="back-to-overview-button"
        >
          ← Back to orders
        </LocalizedClientLink>
      </div>

      <div className="flex flex-col divide-y divide-[var(--theme-border)]" data-testid="order-details-container">
        <OrderDetails order={order} showStatus />
        <Items order={order} />
        <ShippingDetails order={order} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
