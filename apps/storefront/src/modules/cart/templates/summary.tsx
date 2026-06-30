"use client"

import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import DiscountCode from "@modules/checkout/components/discount-code"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) return "address"
  if (cart?.shipping_methods?.length === 0) return "delivery"
  return "payment"
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const { currency_code, item_subtotal, shipping_subtotal, discount_subtotal, total } = cart

  return (
    <div className="flex flex-col gap-6 border border-[var(--theme-border)] p-6 small:p-8">
      <h2 className="font-sans text-[12px] small:text-[13px] uppercase tracking-[4px] text-[var(--theme-text)]">
        Sumar
      </h2>

      <DiscountCode cart={cart} />

      <div className="flex flex-col gap-3 font-sans text-[12px] small:text-[13px] uppercase tracking-[2px]">
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

      </div>

      <div className="border-t border-[var(--theme-border)] pt-4 flex justify-between items-baseline">
        <span className="font-sans text-[12px] small:text-[13px] uppercase tracking-[3px] text-[var(--theme-text-muted)]">Total</span>
        <span
          className="font-display text-[22px] small:text-[26px] leading-none text-hunter-gold"
          data-testid="cart-total"
          data-value={total ?? 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>

      <LocalizedClientLink href={"/checkout?step=" + step} data-testid="checkout-button">
        <button className="w-full py-3.5 font-sans text-[12px] small:text-[13px] uppercase tracking-[4px] bg-hunter-gold text-hunter-dark hover:opacity-90 transition-opacity">
          Finalizează comanda
        </button>
      </LocalizedClientLink>

      <LocalizedClientLink href="/store" className="text-center font-sans text-[11px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors">
        Continuă cumpărăturile
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
