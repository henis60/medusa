"use client"

import { convertToLocale } from "@lib/util/money"
import { useTranslations } from "next-intl"
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
  // Shipping isn't known/calculated yet on the cart page (no address/
  // delivery method chosen there) — only show this row once checkout has
  // that information.
  showShipping?: boolean
}

const CartTotals: React.FC<CartTotalsProps> = ({
  totals,
  showTax = false,
  showShipping = false,
}) => {
  const { currency_code, total, tax_total, item_subtotal, shipping_subtotal, discount_subtotal } = totals
  const t = useTranslations("common")

  return (
    <>
      <div className="flex flex-col gap-3 font-sans text-[12px] small:text-[13px] uppercase tracking-[2px]">
        <div className="flex justify-between text-[var(--theme-text-muted)]">
          <span>{t("Produse")}</span>
          <span data-testid="cart-subtotal" data-value={item_subtotal ?? 0}>
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>

        {showShipping && (
          <div className="flex justify-between text-[var(--theme-text-muted)]">
            <span>{t("Livrare")}</span>
            <span data-testid="cart-shipping" data-value={shipping_subtotal ?? 0}>
              {shipping_subtotal
                ? convertToLocale({ amount: shipping_subtotal, currency_code })
                : "—"}
            </span>
          </div>
        )}

        {!!discount_subtotal && (
          <div className="flex justify-between text-hunter-gold">
            <span>{t("Reducere")}</span>
            <span data-testid="cart-discount" data-value={discount_subtotal}>
              − {convertToLocale({ amount: discount_subtotal, currency_code })}
            </span>
          </div>
        )}

        {showTax && (
          <div className="flex justify-between text-[var(--theme-text-muted)]">
            <span>{t("TVA")}</span>
            <span data-testid="cart-taxes" data-value={tax_total ?? 0}>
              {convertToLocale({ amount: tax_total ?? 0, currency_code })}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-[var(--theme-border)] pt-4 flex justify-between items-baseline">
        <span className="font-sans text-[12px] small:text-[13px] uppercase tracking-[3px] text-[var(--theme-text-muted)]">
          {t("Total")}
        </span>
        <span
          className="font-display text-[22px] small:text-[26px] leading-none text-hunter-gold"
          data-testid="cart-total"
          data-value={total ?? 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
    </>
  )
}

export default CartTotals
