import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  return (
    <div className="sticky top-0 flex flex-col-reverse small:flex-col gap-y-8 py-8 small:py-0">
      <div className="w-full flex flex-col gap-6 border border-[var(--theme-border)] p-6 small:p-8">
        <ItemsPreviewTemplate cart={cart} />
        <Divider />
        <DiscountCode cart={cart} />
        <CartTotals totals={cart} />
        <Divider />
        {/* Netopia partner brand requirement: display their payment badge
            where checkout/payment happens. */}
        <div className="flex justify-center">
          <Image
            src="/payments/netopia-badge-light.png"
            alt="Plăți securizate cu Netopia Payments"
            width={1852}
            height={349}
            className="h-8 w-auto dark:hidden"
          />
          <Image
            src="/payments/netopia-badge-dark.png"
            alt="Plăți securizate cu Netopia Payments"
            width={1852}
            height={349}
            className="hidden h-8 w-auto dark:block"
          />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
