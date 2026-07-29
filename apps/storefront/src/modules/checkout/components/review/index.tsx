"use client"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const t = useTranslations("checkout")
  const searchParams = useSearchParams()
  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard = !!(
    (cart as any)?.gift_cards?.length > 0 && cart?.total === 0
  )

  const previousStepsCompleted =
    cart.shipping_address &&
    (cart.shipping_methods?.length ?? 0) > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <div className={!isOpen ? "opacity-50 pointer-events-none select-none" : ""}>
      <div className="flex items-center mb-6">
        <span className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)]">
          {t("Confirmare comandă")}
        </span>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <p className="font-sans text-[10px] text-[var(--theme-text-muted)] leading-relaxed mb-6">
            {t("Prin plasarea comenzii, confirmi că ai citit și ești de acord cu")}{" "}
            <span className="text-[var(--theme-text)]">{t("Termenii și Condițiile")}</span>,{" "}
            <span className="text-[var(--theme-text)]">{t("Politica de Returnare")}</span> și{" "}
            <span className="text-[var(--theme-text)]">{t("Politica de Confidențialitate")}</span>.
          </p>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      )}
    </div>
  )
}

export default Review
