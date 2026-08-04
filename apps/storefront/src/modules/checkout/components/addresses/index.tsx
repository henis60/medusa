"use client"
import { setAddresses } from "@lib/data/cart"
import useToggleState from "@lib/hooks/use-toggle-state"
import compareAddresses from "@lib/util/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"
import {
  bodyMutedClass,
  bodyTextClass,
  editLinkClass,
  fieldLabelClass,
  sectionTitleClass,
} from "@modules/checkout/components/typography"
import { useSearchParams } from "next/navigation"
import { usePathname, useRouter } from "@i18n/navigation"
import { useActionState, useState } from "react"
import { useTranslations } from "next-intl"
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
  const t = useTranslations("checkout")
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("pas") === "adresa"

  const { state: sameAsBilling, toggle: toggleSameAsBilling, close: uncheckSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  // Set when a billing-flagged address is picked from the saved addresses
  // dropdown — passed down to prefill the billing form instead of just
  // unchecking "same as shipping" and leaving it blank.
  const [billingPrefill, setBillingPrefill] = useState<HttpTypes.StoreCartAddress | null>(null)
  const handleBillingAddressSelected = (address: HttpTypes.StoreCartAddress) => {
    uncheckSameAsBilling()
    setBillingPrefill(address)
  }

  const handleEdit = () => {
    router.push(pathname + "?pas=adresa", { scroll: false })
  }

  const [message, formAction] = useActionState(setAddresses, null)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className={sectionTitleClass}>
            {t("Adresa de livrare")}
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
            className={editLinkClass}
            data-testid="edit-address-button"
          >
            {t("Modifică")}
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
              onBillingAddressSelected={handleBillingAddressSelected}
              cart={cart}
            />

            {!sameAsBilling && (
              <div>
                <p className={`${sectionTitleClass} pb-6 pt-8`}>
                  {t("Adresă de facturare")}
                </p>
                <BillingAddress cart={cart} prefill={billingPrefill} />
              </div>
            )}
            <SubmitButton className="mt-6" data-testid="submit-address-button">
              {t("Continuă cu livrarea")}
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
                  <span className={fieldLabelClass}>{t("Adresă")}</span>
                  <span className={bodyTextClass}>
                    {cart.shipping_address.first_name} {cart.shipping_address.last_name}
                  </span>
                  <span className={bodyMutedClass}>
                    {cart.shipping_address.address_1} {cart.shipping_address.address_2}
                  </span>
                  <span className={bodyMutedClass}>
                    {cart.shipping_address.postal_code}, {cart.shipping_address.city}
                  </span>
                  <span className={bodyMutedClass}>
                    {cart.shipping_address.country_code?.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-col w-1/3 gap-1" data-testid="shipping-contact-summary">
                  <span className={fieldLabelClass}>{t("Contact")}</span>
                  <span className={bodyTextClass}>{cart.shipping_address.phone}</span>
                  <span className={bodyTextClass}>{cart.email}</span>
                </div>

                <div className="flex flex-col w-1/3 gap-1" data-testid="billing-address-summary">
                  <span className={fieldLabelClass}>{t("Facturare")}</span>
                  {sameAsBilling ? (
                    <span className={bodyTextClass}>{t("Identică cu livrarea")}</span>
                  ) : (
                    <>
                      <span className={bodyTextClass}>
                        {cart.billing_address?.first_name} {cart.billing_address?.last_name}
                      </span>
                      <span className={bodyMutedClass}>
                        {cart.billing_address?.address_1} {cart.billing_address?.address_2}
                      </span>
                      <span className={bodyMutedClass}>
                        {cart.billing_address?.postal_code}, {cart.billing_address?.city}
                      </span>
                      <span className={bodyMutedClass}>
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
