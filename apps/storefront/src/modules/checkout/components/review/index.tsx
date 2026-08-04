"use client"

import { useEffect, useState } from "react"
import PaymentButton from "../payment-button"
import ErrorMessage from "../error-message"
import { initiatePaymentSession } from "@lib/data/cart"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"
import { bodyMutedClass, sectionTitleClass } from "@modules/checkout/components/typography"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getDisplayableErrorMessage } from "@lib/util/stale-deployment"
import Spinner from "@modules/common/icons/spinner"

// Netopia is the store's only payment provider, so there's no method to pick
// — the session is initiated silently as soon as this step opens, instead of
// showing a payment-method-selection UI (the old, now-removed "Plată" step).
const Review = ({
  cart,
  availablePaymentMethods,
}: {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: { id: string }[]
}) => {
  const t = useTranslations("checkout")
  const searchParams = useSearchParams()
  const isOpen = searchParams.get("pas") === "sumar"

  const paidByGiftcard = !!(
    (cart as any)?.gift_cards?.length > 0 && cart?.total === 0
  )

  const previousStepsCompleted =
    cart.shipping_address && (cart.shipping_methods?.length ?? 0) > 0

  const hasPaymentSession = !!cart.payment_collection?.payment_sessions?.length
  const [initiating, setInitiating] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    if (
      !isOpen ||
      !previousStepsCompleted ||
      paidByGiftcard ||
      hasPaymentSession ||
      initiating
    ) {
      return
    }
    const providerId = availablePaymentMethods[0]?.id
    if (!providerId) return

    setInitiating(true)
    setInitError(null)
    initiatePaymentSession(cart, { provider_id: providerId })
      .catch((err) =>
        setInitError(getDisplayableErrorMessage(err, t("A apărut o eroare Reîncearcă")))
      )
      .finally(() => setInitiating(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, previousStepsCompleted, paidByGiftcard, hasPaymentSession])

  return (
    <div className={!isOpen ? "opacity-50 pointer-events-none select-none" : ""}>
      <div className="flex items-center mb-6">
        <span className={sectionTitleClass}>
          {t("Confirmare comandă")}
        </span>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <p className={`${bodyMutedClass} leading-relaxed mb-6`}>
            {t("Prin plasarea comenzii, confirmi că ai citit și ești de acord cu")}{" "}
            <LocalizedClientLink
              href="/terms-of-use"
              className="text-[var(--theme-text)] border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors"
            >
              {t("Termenii și Condițiile")}
            </LocalizedClientLink>
            ,{" "}
            <LocalizedClientLink
              href="/relatii-clienti#retur"
              className="text-[var(--theme-text)] border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors"
            >
              {t("Politica de Returnare")}
            </LocalizedClientLink>
            {" "}și{" "}
            <LocalizedClientLink
              href="/privacy-policy"
              className="text-[var(--theme-text)] border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors"
            >
              {t("Politica de Confidențialitate")}
            </LocalizedClientLink>
            .
          </p>
          {paidByGiftcard || hasPaymentSession ? (
            <PaymentButton cart={cart} data-testid="submit-order-button" />
          ) : (
            // Same gold button treatment as the real payment button below
            // (just disabled, with a spinner) instead of a plain gray
            // skeleton bar — this step directly precedes that button, so
            // swapping a generic pulse for the real thing read as jarring
            // rather than a continuous "getting ready to pay" state.
            <button
              type="button"
              disabled
              className="w-full py-3 bg-hunter-gold text-[#0D0D0D] font-sans text-[10px] uppercase tracking-[4px] opacity-70 cursor-not-allowed flex items-center justify-center"
            >
              <Spinner size="14" />
            </button>
          )}
          <ErrorMessage error={initError} data-testid="payment-init-error-message" />
        </>
      )}
    </div>
  )
}

export default Review
