import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()
  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--theme-bg)]">
      {/* Back link */}
      <div className="content-container pt-4 pb-0">
        <LocalizedClientLink
          href="/store"
          className="inline-flex items-center gap-2 text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors font-sans text-[11px] uppercase tracking-[3px]"
        >
          <span>←</span>
          <span>Înapoi la shop</span>
        </LocalizedClientLink>
      </div>

      <div className="content-container max-w-3xl py-12 flex flex-col gap-0" data-testid="order-complete-container">
        {isOnboarding && <OnboardingCta orderId={order.id} />}

        {/* Header */}
        <div className="pb-8 border-b border-[var(--theme-border)]">
          <p className="font-sans text-[9px] uppercase tracking-[5px] text-[var(--theme-text-muted)] mb-3">
            Comandă confirmată · #{order.display_id}
          </p>
          <h1 className="font-display text-[36px] small:text-[48px] leading-[1] text-[var(--theme-text)]">
            Îți mulțumim!
          </h1>
        </div>

        {/* Order meta */}
        <div className="py-8 border-b border-[var(--theme-border)]">
          <OrderDetails order={order} />
        </div>

        {/* Items */}
        <div className="py-8 border-b border-[var(--theme-border)]">
          <Items order={order} />
        </div>

        {/* Totals */}
        <div className="py-8 border-b border-[var(--theme-border)]">
          <div className="px-4 small:px-8">
            <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-5">
              Total
            </p>
            <CartTotals totals={order} />
          </div>
        </div>

        {/* Shipping */}
        <div className="py-8 border-b border-[var(--theme-border)]">
          <ShippingDetails order={order} />
        </div>

        {/* Payment */}
        <div className="py-8 border-b border-[var(--theme-border)]">
          <PaymentDetails order={order} />
        </div>

        {/* Help */}
        <div className="py-8">
          <Help />
        </div>
      </div>
    </div>
  )
}
