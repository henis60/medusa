"use client"
import { setAddresses } from "@lib/data/cart"
import useToggleState from "@lib/hooks/use-toggle-state"
import compareAddresses from "@lib/util/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)]">
            Adresa de livrare
          </span>
          {!isOpen && cart?.shipping_address && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-hunter-gold">
              <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1"/>
              <path d="M3.5 6l1.8 1.8L8.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        {!isOpen && cart?.shipping_address && (
          <button
            onClick={handleEdit}
            className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
            data-testid="edit-address-button"
          >
            Modifică
          </button>
        )}
      </div>

      {isOpen ? (
        <form action={formAction}>
          <div className="pb-8">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />

            {!sameAsBilling && (
              <div>
                <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] pb-6 pt-8">
                  Adresă de facturare
                </p>
                <BillingAddress cart={cart} />
              </div>
            )}
            <SubmitButton className="mt-6" data-testid="submit-address-button">
              Continuă cu livrarea
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          {cart && cart.shipping_address ? (
            <div className="flex items-start gap-x-8">
              <div className="flex items-start gap-x-1 w-full">
                <div className="flex flex-col w-1/3 gap-1" data-testid="shipping-address-summary">
                  <span className="font-sans text-[8px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-1">Adresă</span>
                  <span className="font-serif italic text-[13px] text-[var(--theme-text)]">
                    {cart.shipping_address.first_name} {cart.shipping_address.last_name}
                  </span>
                  <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">
                    {cart.shipping_address.address_1} {cart.shipping_address.address_2}
                  </span>
                  <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">
                    {cart.shipping_address.postal_code}, {cart.shipping_address.city}
                  </span>
                  <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">
                    {cart.shipping_address.country_code?.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-col w-1/3 gap-1" data-testid="shipping-contact-summary">
                  <span className="font-sans text-[8px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-1">Contact</span>
                  <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">{cart.shipping_address.phone}</span>
                  <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">{cart.email}</span>
                </div>

                <div className="flex flex-col w-1/3 gap-1" data-testid="billing-address-summary">
                  <span className="font-sans text-[8px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-1">Facturare</span>
                  {sameAsBilling ? (
                    <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">Identică cu livrarea</span>
                  ) : (
                    <>
                      <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">
                        {cart.billing_address?.first_name} {cart.billing_address?.last_name}
                      </span>
                      <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">
                        {cart.billing_address?.address_1} {cart.billing_address?.address_2}
                      </span>
                      <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">
                        {cart.billing_address?.postal_code}, {cart.billing_address?.city}
                      </span>
                      <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">
                        {cart.billing_address?.country_code?.toUpperCase()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Spinner />
          )}
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Addresses
