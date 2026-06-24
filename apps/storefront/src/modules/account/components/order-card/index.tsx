import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  const itemCount = order.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0

  return (
    <LocalizedClientLink
      href={`/account/orders/details/${order.id}`}
      data-testid="order-card"
      className="group flex items-center justify-between py-5 border-b border-[var(--theme-border)] last:border-none hover:bg-[var(--theme-surface)] px-2 -mx-2 transition-colors"
    >
      <div className="flex flex-col gap-1">
        <span
          className="font-sans text-[11px] uppercase tracking-[2px] text-[var(--theme-text)]"
          data-testid="order-display-id"
        >
          #{order.display_id}
        </span>
        <span
          className="font-serif italic text-[13px] text-[var(--theme-text-muted)]"
          data-testid="order-created-at"
        >
          {new Date(order.created_at).toDateString()} · {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <span
          className="font-display text-[14px] leading-none text-[var(--theme-gold)]"
          data-testid="order-amount"
        >
          {convertToLocale({ amount: order.total, currency_code: order.currency_code })}
        </span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)] transition-colors">
          <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </LocalizedClientLink>
  )
}

export default OrderCard
