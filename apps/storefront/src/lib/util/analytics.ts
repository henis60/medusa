/**
 * GA4 e-commerce event helpers.
 *
 * All events are sent through `gtag`, which is installed by
 * `GoogleAnalytics` in the root layout. Consent Mode v2 gates whether these
 * events actually set cookies / are used for measurement: if the user has not
 * accepted analytics cookies, `analytics_storage` stays "denied" and GA
 * discards the hit. So it is safe to call these unconditionally — no extra
 * consent check is needed at the call site.
 *
 * If GA is not configured (no measurement id) `window.gtag` is undefined and
 * these become no-ops.
 */

type GtagItem = {
  item_id: string
  item_name: string
  price?: number
  quantity?: number
  item_variant?: string
  item_category?: string
}

function track(event: string, params: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return
  window.gtag("event", event, params)
}

export type TrackItemInput = {
  id: string
  name: string
  price?: number
  quantity?: number
  variant?: string
  category?: string
}

function toGtagItem(item: TrackItemInput): GtagItem {
  return {
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity ?? 1,
    item_variant: item.variant,
    item_category: item.category,
  }
}

function itemsValue(items: TrackItemInput[]): number {
  return items.reduce(
    (sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 1),
    0
  )
}

export function trackViewItem(
  item: TrackItemInput,
  currency = "RON"
) {
  track("view_item", {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [toGtagItem(item)],
  })
}

export function trackAddToCart(
  item: TrackItemInput,
  currency = "RON"
) {
  track("add_to_cart", {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [toGtagItem(item)],
  })
}

export function trackRemoveFromCart(
  item: TrackItemInput,
  currency = "RON"
) {
  track("remove_from_cart", {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [toGtagItem(item)],
  })
}

export function trackViewCart(
  items: TrackItemInput[],
  currency = "RON",
  value?: number
) {
  track("view_cart", {
    currency,
    value: value ?? itemsValue(items),
    items: items.map(toGtagItem),
  })
}

export function trackBeginCheckout(
  items: TrackItemInput[],
  currency = "RON",
  value?: number
) {
  track("begin_checkout", {
    currency,
    value: value ?? itemsValue(items),
    items: items.map(toGtagItem),
  })
}

export function trackAddShippingInfo(
  items: TrackItemInput[],
  currency = "RON",
  value?: number,
  shippingTier?: string
) {
  track("add_shipping_info", {
    currency,
    value: value ?? itemsValue(items),
    shipping_tier: shippingTier,
    items: items.map(toGtagItem),
  })
}

export function trackAddPaymentInfo(
  items: TrackItemInput[],
  currency = "RON",
  value?: number,
  paymentType?: string
) {
  track("add_payment_info", {
    currency,
    value: value ?? itemsValue(items),
    payment_type: paymentType,
    items: items.map(toGtagItem),
  })
}

export function trackPurchase(input: {
  transactionId: string
  value: number
  currency?: string
  items: TrackItemInput[]
  tax?: number
  shipping?: number
  coupon?: string
}) {
  track("purchase", {
    transaction_id: input.transactionId,
    value: input.value,
    currency: input.currency ?? "RON",
    tax: input.tax,
    shipping: input.shipping,
    coupon: input.coupon,
    items: input.items.map(toGtagItem),
  })
}

/**
 * Maps Medusa cart/order line items to GA4 item payloads. Amounts in Medusa v2
 * (`unit_price`, totals) are already in the currency's major unit, matching
 * what GA4 expects.
 */
type MedusaLineItem = {
  id: string
  product_id?: string | null
  product_title?: string | null
  title?: string | null
  variant_title?: string | null
  quantity?: number | null
  unit_price?: number | null
  variant?: { id?: string; title?: string | null } | null
}

export function lineItemsToTrackItems(
  items: MedusaLineItem[] | null | undefined
): TrackItemInput[] {
  if (!items) return []
  return items.map((i) => ({
    id: i.product_id ?? i.variant?.id ?? i.id,
    name: i.product_title ?? i.title ?? "",
    price: i.unit_price ?? undefined,
    quantity: i.quantity ?? 1,
    variant: i.variant_title ?? i.variant?.title ?? undefined,
  }))
}

export function trackAddToWishlist(
  item: TrackItemInput,
  currency = "RON"
) {
  track("add_to_wishlist", {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [toGtagItem(item)],
  })
}
