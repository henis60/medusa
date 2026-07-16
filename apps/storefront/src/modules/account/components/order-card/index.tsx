import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

const STATUS_LABEL: Record<string, string> = {
  pending: "În așteptare",
  not_fulfilled: "În procesare",
  partially_fulfilled: "Parțial livrată",
  fulfilled: "Livrată",
  canceled: "Anulată",
  returned: "Returnată",
  partially_returned: "Parțial returnată",
  requires_action: "Necesită acțiune",
}

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  const status = order.fulfillment_status
    ? STATUS_LABEL[order.fulfillment_status] ?? order.fulfillment_status
    : null

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
