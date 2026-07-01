"use client"
import { RadioGroup } from "@headlessui/react"
import { isStripeLike, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { CreditCard } from "@medusajs/icons"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, { StripeCardContainer } from "@modules/checkout/components/payment-container"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: { id: string }[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const isOpen = searchParams.get("step") === "payment"

  const paidByGiftcard = !!(
    (cart as any)?.gift_cards?.length > 0 && cart?.total === 0
  )

  const paymentReady =
    (activeSession && (cart?.shipping_methods?.length ?? 0) !== 0) || paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    if (isStripeLike(method)) {
      await initiatePaymentSession(cart, { provider_id: method })
    }
  }

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), { scroll: false })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const shouldInputCard = isStripeLike(selectedPaymentMethod) && !activeSession
      if (activeSession?.provider_id !== selectedPaymentMethod) {
        await initiatePaymentSession(cart, { provider_id: selectedPaymentMethod })
      }
      if (!shouldInputCard) {
        router.push(pathname + "?" + createQueryString("step", "review"), { scroll: false })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { setError(null) }, [isOpen])

  return (
    <div className={!isOpen && !paymentReady ? "opacity-50 pointer-events-none select-none" : ""}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)]">
            Plată
          </span>
          {!isOpen && paymentReady && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-hunter-gold">
              <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1"/>
              <path d="M3.5 6l1.8 1.8L8.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        {!isOpen && paymentReady && (
          <button
            onClick={handleEdit}
            className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
            data-testid="edit-payment-button"
          >
            Modifică
          </button>
        )}
      </div>

      <div className={isOpen ? "block" : "hidden"}>
        {!paidByGiftcard && availablePaymentMethods?.length ? (
          <RadioGroup
            value={selectedPaymentMethod}
            onChange={(value: string) => setPaymentMethod(value)}
            className="mb-6"
          >
            {availablePaymentMethods.map((method) => (
              <div key={method.id}>
                {isStripeLike(method.id) ? (
                  <StripeCardContainer
                    paymentProviderId={method.id}
                    selectedPaymentOptionId={selectedPaymentMethod}
                    paymentInfoMap={paymentInfoMap}
                    setCardBrand={setCardBrand}
                    setError={setError}
                    setCardComplete={setCardComplete}
                  />
                ) : (
                  <PaymentContainer
                    paymentInfoMap={paymentInfoMap}
                    paymentProviderId={method.id}
                    selectedPaymentOptionId={selectedPaymentMethod}
                  />
                )}
              </div>
            ))}
          </RadioGroup>
        ) : null}

        {paidByGiftcard && (
          <div className="mb-6">
            <span className="font-sans text-[8px] uppercase tracking-[3px] text-[var(--theme-text-muted)] block mb-1">Metodă de plată</span>
            <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">Card cadou</span>
          </div>
        )}

        <ErrorMessage error={error} data-testid="payment-method-error-message" />

        <button
          onClick={handleSubmit}
          disabled={
            isLoading ||
            (isStripeLike(selectedPaymentMethod) && !cardComplete) ||
            (!selectedPaymentMethod && !paidByGiftcard)
          }
          data-testid="submit-payment-button"
          className="w-full py-3 bg-hunter-gold text-[#0D0D0D] font-sans text-[10px] uppercase tracking-[4px] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? "Se procesează…" :
            !activeSession && isStripeLike(selectedPaymentMethod)
              ? "Introdu datele cardului"
              : "Continuă cu confirmarea"}
        </button>
      </div>

      <div className={isOpen ? "hidden" : "block"}>
        {cart && paymentReady && activeSession ? (
          <div className="flex items-start gap-8">
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[8px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-1">Metodă</span>
              <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]" data-testid="payment-method-summary">
                {paymentInfoMap[activeSession?.provider_id]?.title || activeSession?.provider_id}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[8px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-1">Detalii</span>
              <div className="flex items-center gap-2" data-testid="payment-details-summary">
                <span className="flex items-center p-1 border border-[var(--theme-border)]">
                  {paymentInfoMap[selectedPaymentMethod]?.icon || <CreditCard />}
                </span>
                <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">
                  {isStripeLike(selectedPaymentMethod) && cardBrand ? cardBrand : "Un pas suplimentar va apărea"}
                </span>
              </div>
            </div>
          </div>
        ) : paidByGiftcard ? (
          <div className="flex flex-col gap-1">
            <span className="font-sans text-[8px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-1">Metodă de plată</span>
            <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]" data-testid="payment-method-summary">Card cadou</span>
          </div>
        ) : null}
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
