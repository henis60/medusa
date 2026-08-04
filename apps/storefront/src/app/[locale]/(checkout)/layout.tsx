import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartRefreshOnUpdate from "@modules/cart/components/cart-refresh-on-update"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-[var(--theme-bg)] relative small:min-h-screen">
      {/* Without this, applying a promo code mid-checkout mutates the cart
          server-side (which can invalidate/recreate the payment session)
          but nothing tells the checkout page's Server Components to
          re-render with the fresh cart — Review keeps deciding whether to
          show the real payment button off a stale `cart` prop, so its
          "preparing payment" spinner can spin forever until a hard reload.
          Same fix already used on the /cart page. */}
      <CartRefreshOnUpdate />
      <div className="h-16 bg-[var(--theme-bg)] backdrop-blur-md border-b border-[var(--theme-border)]">
        <nav className="flex h-full items-center content-container justify-between">
          <div className="flex-1 basis-0" />
          <LocalizedClientLink
            href="/"
            className="font-display text-xl tracking-[0.12em] flex items-baseline gap-1.5 hover:opacity-80 transition-opacity"
            data-testid="store-link"
          >
            <span className="text-[var(--theme-text)] uppercase">
              The Hunter
            </span>
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
    </div>
  )
}
