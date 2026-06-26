import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const fmt = (amount?: number | null) =>
    amount
      ? convertToLocale({ amount, currency_code: order.currency_code })
      : null

  return (
    <div className="small:px-8 py-6">
      <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-5">
        Sumar
      </p>
      <div className="flex flex-col gap-2 small:max-w-xs small:ml-auto">
        <div className="flex items-center justify-between font-sans text-[12px]">
          <span className="text-[var(--theme-text-muted)]">Subtotal</span>
          <span className="text-[var(--theme-text)]">
            {fmt(order.subtotal)}
          </span>
        </div>
        {order.discount_total > 0 && (
          <div className="flex items-center justify-between font-sans text-[12px]">
            <span className="text-[var(--theme-text-muted)]">Reducere</span>
            <span className="text-emerald-500">
              − {fmt(order.discount_total)}
            </span>
          </div>
        )}
        {order.gift_card_total > 0 && (
          <div className="flex items-center justify-between font-sans text-[12px]">
            <span className="text-[var(--theme-text-muted)]">Card cadou</span>
            <span className="text-emerald-500">
              − {fmt(order.gift_card_total)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between font-sans text-[12px]">
          <span className="text-[var(--theme-text-muted)]">Transport</span>
          <span className="text-[var(--theme-text)]">
            {fmt(order.shipping_total)}
          </span>
        </div>
        <div className="flex items-center justify-between font-sans text-[12px]">
          <span className="text-[var(--theme-text-muted)]">Taxe</span>
          <span className="text-[var(--theme-text)]">
            {fmt(order.tax_total)}
          </span>
        </div>
        <div className="border-t border-[var(--theme-border)] pt-3 mt-1 flex items-baseline justify-between">
          <span className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)]">
            Total
          </span>
          <span className="font-display text-[16px] leading-none text-hunter-gold">
            {fmt(order.total)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
