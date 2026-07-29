"use client"

import { useTranslations } from "next-intl"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

const STATUS_KEYS: Record<string, string> = {
  pending: "pending",
  not_fulfilled: "not_fulfilled",
  partially_fulfilled: "partially_fulfilled",
  fulfilled: "fulfilled",
  canceled: "canceled",
  returned: "returned",
  partially_returned: "partially_returned",
  requires_action: "requires_action",
}

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  const t = useTranslations("account")
  const statusKey = order.fulfillment_status
    ? STATUS_KEYS[order.fulfillment_status]
    : null
  const status = statusKey ? t(statusKey) : order.fulfillment_status

  return (
    <LocalizedClientLink
      href={`/profil/comenzi/${order.display_id}`}
      data-testid="order-card"
      className="group flex items-center justify-between gap-4 py-5 px-3 -mx-3 hover:bg-[var(--theme-surface)] active:bg-[var(--theme-surface)] transition-colors"
    >
      <div className="flex flex-col gap-1.5">
        <span
          className="font-display text-[22px] leading-none text-[var(--theme-text)]"
          data-testid="order-display-id"
        >
          #{order.display_id}
        </span>
        <span
          className="font-sans text-[10px] uppercase tracking-[2px] text-[var(--theme-text-muted)]"
          data-testid="order-status"
        >
          {status && `${status}`}
        </span>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span
          className="font-sans text-[13px] tracking-[1px] text-hunter-gold"
          data-testid="order-amount"
        >
          {convertToLocale({
            amount: order.total,
            currency_code: order.currency_code,
          })}
        </span>
        <span
          aria-hidden
          className="font-serif text-[18px] text-hunter-gold/40 group-hover:text-hunter-gold group-active:text-hunter-gold group-active:translate-x-0.5 transition-all"
        >
          ›
        </span>
      </div>
    </LocalizedClientLink>
  )
}

export default OrderCard
