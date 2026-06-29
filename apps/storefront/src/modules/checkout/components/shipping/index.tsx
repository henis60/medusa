"use client"
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Radio,
  RadioGroup,
} from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import {
  EawbLocker,
  listEawbLockers,
  listEawbShippingPrices,
} from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { ChevronUpDown, Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

// A shipping option that delivers to a parcel locker (its name ends in
// "... la locker") requires the customer to pick a specific locker.
const isLockerOption = (o: HttpTypes.StoreCartShippingOption) =>
  /la locker\s*$/i.test(o.name ?? "")

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

// Caches calculated prices per cart + destination signature, so returning to
// the delivery step (e.g. after going back from payment) reuses the result
// instead of re-querying the courier. Changing the address busts the cache.
const pricesCache = new Map<string, Record<string, number>>()

function priceCacheKey(cart: HttpTypes.StoreCart): string {
  const a = cart.shipping_address
  const itemCount = (cart.items ?? []).reduce((s, i) => s + (i.quantity ?? 0), 0)
  return [
    cart.id,
    a?.city ?? "",
    a?.province ?? "",
    a?.address_1 ?? "",
    a?.country_code ?? "",
    itemCount,
  ].join("|")
}

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
  // Locker picker state (for "...to locker" services).
  const [lockerOptionId, setLockerOptionId] = useState<string | null>(null)
  const [lockers, setLockers] = useState<EawbLocker[]>([])
  const [loadingLockers, setLoadingLockers] = useState(false)
  const [selectedLocker, setSelectedLocker] = useState<EawbLocker | null>(null)
  const [lockerQuery, setLockerQuery] = useState("")

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

  // Show only options that are actually offered: flat-rate ones always, and
  // calculated ones only once they have a price (a courier that's inactive in
  // the eAWB account or doesn't serve the address returns no price). While
  // prices are loading we still show the calculated options with a spinner.
  const visibleShippingMethods = _shippingMethods?.filter(
    (o) =>
      o.price_type !== "calculated" ||
      isLoadingPrices ||
      (calculatedPricesMap[o.id] ?? 0) > 0
  )

  useEffect(() => {
    const hasCalculated = _shippingMethods?.some(
      (sm) => sm.price_type === "calculated"
    )
    if (hasCalculated) {
      const cacheKey = priceCacheKey(cart)
      const cached = pricesCache.get(cacheKey)
      if (cached) {
        // Already computed for this cart + address — reuse, no recalculation.
        setCalculatedPricesMap(cached)
        setIsLoadingPrices(false)
      } else {
        setIsLoadingPrices(true)
        // One request for all calculated options (backend queries Europarcel once).
        // The backend already returns only positive prices; options absent from
        // the map are treated as unavailable and disabled below.
        listEawbShippingPrices(cart.id).then((prices) => {
          pricesCache.set(cacheKey, prices)
          setCalculatedPricesMap(prices)
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

  const handleSetShippingMethod = async (
    id: string,
    variant: "shipping" | "pickup",
    data?: Record<string, unknown>
  ) => {
    setError(null)
    if (variant === "pickup") setShowPickupOptions(PICKUP_OPTION_ON)
    else setShowPickupOptions(PICKUP_OPTION_OFF)
    let currentId: string | null = null
    setIsLoading(true)
    setShippingMethodId((prev) => { currentId = prev; return id })
    await setShippingMethod({ cartId: cart.id, shippingMethodId: id, data })
      .catch((err) => { setShippingMethodId(currentId); setError(err.message) })
      .finally(() => setIsLoading(false))
  }

  // Picking a shipping option: locker services open the locker picker and are
  // only committed once a locker is chosen; all others commit immediately.
  const handleSelectOption = (option: HttpTypes.StoreCartShippingOption) => {
    if (isLockerOption(option)) {
      setShippingMethodId(option.id)
      setLockerOptionId(option.id)
      setSelectedLocker(null)
      setLockerQuery("")
      setLoadingLockers(true)
      listEawbLockers(option.id, cart.id).then((ls) => {
        setLockers(ls)
        setLoadingLockers(false)
      })
    } else {
      setLockerOptionId(null)
      setSelectedLocker(null)
      handleSetShippingMethod(option.id, "shipping")
    }
  }

  const handleSelectLocker = (locker: EawbLocker | null) => {
    if (!locker || !lockerOptionId) return
    setSelectedLocker(locker)
    handleSetShippingMethod(lockerOptionId, "shipping", {
      fixed_location_id: locker.id,
      locker_name: locker.name,
    })
  }

  const filteredLockers = lockerQuery
    ? lockers.filter((l) =>
        `${l.name} ${l.address}`
          .toLowerCase()
          .includes(lockerQuery.trim().toLowerCase())
      )
    : lockers

  useEffect(() => { setError(null) }, [isOpen])

  // Restore the locker picker when returning to the step with a locker service
  // already selected on the cart. Skips if a locker is already being handled in
  // this session, so committing a selection (which updates the cart) doesn't
  // re-trigger a reload.
  useEffect(() => {
    if (lockerOptionId) return
    const sm = cart.shipping_methods?.at(-1)
    const optId = sm?.shipping_option_id
    if (!optId) return
    const opt = availableShippingMethods?.find((o) => o.id === optId)
    if (!opt || !isLockerOption(opt)) return

    setLockerOptionId(opt.id)
    const d = (sm?.data ?? {}) as { fixed_location_id?: number; locker_name?: string }
    if (d.fixed_location_id) {
      setSelectedLocker({
        id: Number(d.fixed_location_id),
        name: d.locker_name ?? "Locker selectat",
        address: "",
      })
    }
    setLoadingLockers(true)
    listEawbLockers(opt.id, cart.id).then((ls) => {
      setLockers(ls)
      setLoadingLockers(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableShippingMethods])

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
              onChange={(v) => {
                const opt = _shippingMethods?.find((o) => o.id === v)
                if (opt) handleSelectOption(opt)
              }}
            >
              {visibleShippingMethods?.map((option) => {
                return (
                  <Radio
                    key={option.id}
                    value={option.id}
                    data-testid="delivery-option-radio"
                    className={radioClass(option.id === shippingMethodId)}
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
                      ) : isLoadingPrices ? <Loader /> : "Indisponibil"}
                    </span>
                  </Radio>
                )
              })}
            </RadioGroup>

            {!isLoadingPrices &&
              (visibleShippingMethods?.length ?? 0) === 0 &&
              !hasPickupOptions && (
                <p className="font-serif italic text-[13px] text-[var(--theme-text-muted)] py-2">
                  Niciun curier nu livrează la această adresă. Verifică adresa de
                  livrare.
                </p>
              )}

            {lockerOptionId && (
              <div className="mt-2 mb-2 border border-[var(--theme-border)] p-4 flex flex-col gap-2">
                <span className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)]">
                  Alege lockerul <span className="text-rose-500">*</span>
                </span>
                {loadingLockers ? (
                  <span className="flex items-center gap-2 text-[var(--theme-text-muted)] text-[13px]">
                    <Loader /> Se încarcă lockerele…
                  </span>
                ) : lockers.length === 0 ? (
                  <span className="font-serif italic text-[13px] text-[var(--theme-text-muted)]">
                    Niciun locker disponibil pentru acest curier în localitatea ta. Alege livrare la ușă.
                  </span>
                ) : (
                  <Combobox
                    value={selectedLocker}
                    onChange={handleSelectLocker}
                    immediate
                    onClose={() => setLockerQuery("")}
                  >
                    <div className="relative w-full">
                      <ComboboxInput
                        className="appearance-none w-full h-10 px-3 pr-8 bg-transparent border border-[var(--theme-border)] text-[var(--theme-text)] font-sans text-[12px] focus:outline-none focus:border-[var(--theme-text-muted)] hover:border-[var(--theme-text-muted)] transition-colors"
                        displayValue={(l: EawbLocker | null) => l?.name ?? ""}
                        onChange={(e) => setLockerQuery(e.target.value)}
                        placeholder="Caută locker după nume sau adresă"
                        autoComplete="off"
                        data-testid="locker-input"
                      />
                      <ComboboxButton className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]">
                        <ChevronUpDown />
                      </ComboboxButton>
                      <ComboboxOptions
                        anchor="bottom start"
                        className="z-50 max-h-40 overflow-auto border border-[var(--theme-border)] bg-[var(--theme-bg,#0D0D0D)] shadow-lg focus:outline-none [--anchor-gap:4px]"
                        style={{ width: "var(--input-width)" }}
                      >
                        {filteredLockers.length === 0 ? (
                          <div className="px-3 py-1.5 font-sans text-[12px] text-[var(--theme-text-muted)]">
                            Niciun rezultat
                          </div>
                        ) : (
                          filteredLockers.map((l) => (
                            <ComboboxOption
                              key={l.id}
                              value={l}
                              className="cursor-pointer px-3 py-1.5 font-sans text-[12px] leading-tight text-[var(--theme-text)] data-[focus]:bg-hunter-gold/10 data-[focus]:text-hunter-gold"
                            >
                              <span className="block truncate">{l.name}</span>
                              <span className="block text-[11px] text-[var(--theme-text-muted)] truncate">
                                {l.address}
                              </span>
                            </ComboboxOption>
                          ))
                        )}
                      </ComboboxOptions>
                    </div>
                  </Combobox>
                )}
                {selectedLocker && (
                  <span className="font-serif italic text-[12px] text-hunter-gold">
                    Selectat: {selectedLocker.name} — {selectedLocker.address}
                  </span>
                )}
              </div>
            )}
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
            disabled={
              isLoading ||
              (!cart.shipping_methods?.[0] && !shippingMethodId) ||
              // A locker service is selected but no locker chosen yet.
              (!!lockerOptionId && !selectedLocker)
            }
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
