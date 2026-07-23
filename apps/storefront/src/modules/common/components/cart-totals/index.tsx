"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
  }
  showTax?: boolean
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals, showTax = false }) => {
  const { currency_code, total, tax_total, item_subtotal, shipping_subtotal, discount_subtotal } = totals

  return (
    <div className="flex flex-col gap-3 font-sans text-[10px] uppercase tracking-[2px]">
      <div className="flex justify-between text-[var(--theme-text-muted)]">
        <span>Produse</span>
        <span data-testid="cart-subtotal" data-value={item_subtotal ?? 0}>
          {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
        </span>
      </div>

      <div className="flex justify-between text-[var(--theme-text-muted)]">
        <span>Livrare</span>
        <span data-testid="cart-shipping" data-value={shipping_subtotal ?? 0}>
          {shipping_subtotal
            ? convertToLocale({ amount: shipping_subtotal, currency_code })
            : "—"}
        </span>
      </div>

      {!!discount_subtotal && (
        <div className="flex justify-between text-hunter-gold">
          <span>Reducere</span>
          <span data-testid="cart-discount" data-value={discount_subtotal}>
            − {convertToLocale({ amount: discount_subtotal, currency_code })}
          </span>
        </div>
      )}

      {showTax && (
        <div className="flex justify-between text-[var(--theme-text-muted)]">
          <span>TVA</span>
          <span data-testid="cart-taxes" data-value={tax_total ?? 0}>
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
      )}

      <div className="border-t border-[var(--theme-border)] pt-3 flex justify-between items-baseline mt-1">
        <span className="text-[var(--theme-text-muted)]">Total</span>
        <span
          className="font-display text-[20px] leading-none text-hunter-gold"
          data-testid="cart-total"
          data-value={total ?? 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
    </div>
  )
}

export default CartTotals
