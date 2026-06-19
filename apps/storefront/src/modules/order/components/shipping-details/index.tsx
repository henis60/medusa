import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  const addr = order.shipping_address

  return (
    <div className="px-4 small:px-8 py-6">
      <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-5">
        Delivery
      </p>
      <div className="grid grid-cols-1 small:grid-cols-3 gap-6">
        <div data-testid="shipping-address-summary">
          <p className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-2">
            Shipping Address
          </p>
          <div className="flex flex-col gap-0.5 font-sans text-[12px] text-[var(--theme-text)]">
            <span>{addr?.first_name} {addr?.last_name}</span>
            <span>{addr?.address_1}{addr?.address_2 && `, ${addr.address_2}`}</span>
            <span>{addr?.postal_code}, {addr?.city}</span>
            <span>{addr?.country_code?.toUpperCase()}</span>
          </div>
        </div>

        <div data-testid="shipping-contact-summary">
          <p className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-2">
            Contact
          </p>
          <div className="flex flex-col gap-0.5 font-sans text-[12px] text-[var(--theme-text)]">
            {addr?.phone && <span>{addr.phone}</span>}
            <span>{order.email}</span>
          </div>
        </div>

        <div data-testid="shipping-method-summary">
          <p className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-2">
            Method
          </p>
          <div className="flex flex-col gap-0.5 font-sans text-[12px] text-[var(--theme-text)]">
            <span>{(order.shipping_methods?.[0] as { name?: string })?.name}</span>
            <span className="text-[var(--theme-text-muted)]">
              {convertToLocale({
                amount: order.shipping_methods?.[0]?.total ?? 0,
                currency_code: order.currency_code,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShippingDetails
