import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  return (
    <div className="sticky top-0 flex flex-col-reverse small:flex-col gap-y-8 py-8 small:py-0">
      <div className="w-full flex flex-col">
        <Divider className="my-6 small:hidden" />
        <span className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)]">
          Coș
        </span>
        <Divider className="my-6" />
        <CartTotals totals={cart} />
        <Divider className="my-6" />
        <ItemsPreviewTemplate cart={cart} />
        <div className="mt-6">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
