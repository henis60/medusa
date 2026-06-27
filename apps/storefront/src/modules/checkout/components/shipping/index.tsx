"use client"
import { Radio, RadioGroup } from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

function formatAddress(address: HttpTypes.StoreCartAddress) {
  if (!address) return ""
  let ret = ""
  if (address.address_1) ret += ` ${address.address_1}`
  if (address.address_2) ret += `, ${address.address_2}`
  if (address.postal_code) ret += `, ${address.postal_code} ${address.city}`
  if (address.country_code) ret += `, ${address.country_code.toUpperCase()}`
  return ret
}

const Shipping: React.FC<ShippingProps> = ({ cart, availableShippingMethods }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [showPickupOptions, setShowPickupOptions] = useState<string>(PICKUP_OPTION_OFF)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const isOpen = searchParams.get("step") === "delivery"

  const _shippingMethods = availableShippingMethods?.filter(
    (sm) => (sm as any).service_zone?.fulfillment_set?.type !== "pickup"
  )
  const _pickupMethods = availableShippingMethods?.filter(
    (sm) => (sm as any).service_zone?.fulfillment_set?.type === "pickup"
  )
  const hasPickupOptions = !!_pickupMethods?.length

  useEffect(() => {
    setIsLoadingPrices(true)
    if (_shippingMethods?.length) {
      const promises = _shippingMethods
        .filter((sm) => sm.price_type === "calculated")
        .map((sm) => calculatePriceForShippingOption(sm.id, cart.id))
      if (promises.length) {
        Promise.allSettled(promises).then((res) => {
          const pricesMap: Record<string, number> = {}
          res.filter((r) => r.status === "fulfilled").forEach((p) => {
            if (p.value?.id) pricesMap[p.value.id] = p.value.amount ?? 0
          })
          setCalculatedPricesMap(pricesMap)
          setIsLoadingPrices(false)
        })
      }
    }
    if (_pickupMethods?.find((m) => m.id === shippingMethodId)) {
      setShowPickupOptions(PICKUP_OPTION_ON)
    }
  }, [availableShippingMethods])

  const handleEdit = () => router.push(pathname + "?step=delivery", { scroll: false })
  const handleSubmit = () => router.push(pathname + "?step=payment", { scroll: false })

  const handleSetShippingMethod = async (id: string, variant: "shipping" | "pickup") => {
    setError(null)
    if (variant === "pickup") setShowPickupOptions(PICKUP_OPTION_ON)
    else setShowPickupOptions(PICKUP_OPTION_OFF)
    let currentId: string | null = null
    setIsLoading(true)
    setShippingMethodId((prev) => { currentId = prev; return id })
    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => { setShippingMethodId(currentId); setError(err.message) })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { setError(null) }, [isOpen])

  const radioClass = (selected: boolean, disabled?: boolean) =>
    `flex items-center justify-between py-3 px-4 border mb-2 cursor-pointer transition-colors ${
      selected ? "border-hunter-gold bg-hunter-gold/5" :
      disabled ? "border-[var(--theme-border)] opacity-40 cursor-not-allowed" :
      "border-[var(--theme-border)] hover:border-[var(--theme-text-muted)]"
    }`

  return (
    <div className={!isOpen && (cart.shipping_methods?.length ?? 0) === 0 ? "opacity-50 pointer-events-none select-none" : ""}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)]">
            Livrare
          </span>
          {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-hunter-gold">
              <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1"/>
              <path d="M3.5 6l1.8 1.8L8.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        {!isOpen && cart?.shipping_address && cart?.billing_address && cart?.email && (
          <button
            onClick={handleEdit}
            className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
            data-testid="edit-delivery-button"
          >
            Modifică
          </button>
        )}
      </div>

      {isOpen ? (
        <>
          <div data-testid="delivery-options-container" className="mb-6">
            {hasPickupOptions && (
              <RadioGroup
                value={showPickupOptions}
                onChange={() => {
                  const id = _pickupMethods?.find((o) => !o.insufficient_inventory)?.id
                  if (id) handleSetShippingMethod(id, "pickup")
                }}
              >
                <Radio
                  value={PICKUP_OPTION_ON}
                  data-testid="delivery-option-radio"
                  className={radioClass(showPickupOptions === PICKUP_OPTION_ON)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full border flex-shrink-0 ${showPickupOptions === PICKUP_OPTION_ON ? "border-hunter-gold bg-hunter-gold" : "border-[var(--theme-border)]"}`} />
                    <span className="font-serif text-[13px] text-[var(--theme-text)]">Ridicare din magazin</span>
                  </div>
                  <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">—</span>
                </Radio>
              </RadioGroup>
            )}

            <RadioGroup
              value={shippingMethodId}
              onChange={(v) => { if (v) handleSetShippingMethod(v, "shipping") }}
            >
              {_shippingMethods?.map((option) => {
                const isDisabled = option.price_type === "calculated" && !isLoadingPrices &&
                  typeof calculatedPricesMap[option.id] !== "number"
                return (
                  <Radio
                    key={option.id}
                    value={option.id}
                    data-testid="delivery-option-radio"
                    disabled={isDisabled}
                    className={radioClass(option.id === shippingMethodId, isDisabled)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full border flex-shrink-0 ${option.id === shippingMethodId ? "border-hunter-gold bg-hunter-gold" : "border-[var(--theme-border)]"}`} />
                      <span className="font-serif text-[13px] text-[var(--theme-text)]">{option.name}</span>
                    </div>
                    <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">
                      {option.price_type === "flat" ? (
                        convertToLocale({ amount: option.amount!, currency_code: cart?.currency_code })
                      ) : calculatedPricesMap[option.id] ? (
                        convertToLocale({ amount: calculatedPricesMap[option.id], currency_code: cart?.currency_code })
                      ) : isLoadingPrices ? <Loader /> : "—"}
                    </span>
                  </Radio>
                )
              })}
            </RadioGroup>
          </div>

          {showPickupOptions === PICKUP_OPTION_ON && (
            <RadioGroup
              value={shippingMethodId}
              onChange={(v) => { if (v) handleSetShippingMethod(v, "pickup") }}
              className="mb-6"
            >
              {_pickupMethods?.map((option) => (
                <Radio
                  key={option.id}
                  value={option.id}
                  disabled={option.insufficient_inventory}
                  data-testid="delivery-option-radio"
                  className={radioClass(option.id === shippingMethodId, option.insufficient_inventory)}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-3 h-3 rounded-full border flex-shrink-0 mt-0.5 ${option.id === shippingMethodId ? "border-hunter-gold bg-hunter-gold" : "border-[var(--theme-border)]"}`} />
                    <div className="flex flex-col">
                      <span className="font-serif text-[13px] text-[var(--theme-text)]">{option.name}</span>
                      <span className="font-serif italic text-[12px] text-[var(--theme-text-muted)]">
                        {formatAddress((option as any).service_zone?.fulfillment_set?.location?.address as HttpTypes.StoreCartAddress)}
                      </span>
                    </div>
                  </div>
                  <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">
                    {convertToLocale({ amount: option.amount!, currency_code: cart?.currency_code })}
                  </span>
                </Radio>
              ))}
            </RadioGroup>
          )}

          <ErrorMessage error={error} data-testid="delivery-option-error-message" />
          <button
            onClick={handleSubmit}
            disabled={isLoading || (!cart.shipping_methods?.[0] && !shippingMethodId)}
            data-testid="submit-delivery-option-button"
            className="w-full py-3 bg-hunter-gold text-[#0D0D0D] font-sans text-[10px] uppercase tracking-[4px] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "Se procesează…" : "Continuă cu metoda de plată"}
          </button>
        </>
      ) : (
        <div>
          {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[8px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-1">Metodă</span>
              <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">
                {cart.shipping_methods!.at(-1)!.name}{" "}
                {convertToLocale({ amount: cart.shipping_methods!.at(-1)!.amount!, currency_code: cart?.currency_code })}
              </span>
            </div>
          )}
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Shipping
