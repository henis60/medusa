import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  return (
    <LocalizedClientLink
      href={`/account/orders/details/${order.id}`}
      data-testid="order-card"
      className="group flex items-center justify-between py-5 small:py-6 border-b border-[var(--theme-border)] last:border-none hover:bg-[var(--theme-surface)] px-3 -mx-3 transition-colors"
    >
      <div className="flex flex-col gap-1.5">
        <span
          className="font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)]"
          data-testid="order-display-id"
        >
          Comanda #{order.display_id}
        </span>
        <span
          className="font-serif text-[20px] small:text-[24px] leading-[1.1] text-[var(--theme-text)]"
          data-testid="order-created-at"
        >
          {new Date(order.created_at).toLocaleDateString("ro-RO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <span
          className="font-display text-[16px] small:text-[20px] leading-none text-hunter-gold"
          data-testid="order-amount"
        >
          {convertToLocale({
            amount: order.total,
            currency_code: order.currency_code,
          })}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)] transition-colors"
        >
          <path
            d="M5 2l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </LocalizedClientLink>
  )
}

export default OrderCard
