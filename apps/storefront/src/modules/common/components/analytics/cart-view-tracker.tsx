"use client"

import { useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import {
  lineItemsToTrackItems,
  trackViewCart,
  trackBeginCheckout,
} from "@lib/util/analytics"

/**
 * Fires a GA4 cart event once on mount. Rendered from server components
 * (cart page / checkout page) since the event must run client-side. Consent is
 * enforced by Consent Mode inside the helper — no extra guard needed here.
 */
export default function CartViewTracker({
  cart,
  event,
}: {
  cart: HttpTypes.StoreCart | null
  event: "view_cart" | "begin_checkout"
}) {
  useEffect(() => {
    if (!cart?.items?.length) return
    const items = lineItemsToTrackItems(cart.items)
    const currency = cart.currency_code?.toUpperCase() || "RON"
    const value = cart.total ?? undefined
    if (event === "view_cart") {
      trackViewCart(items, currency, value)
    } else {
      trackBeginCheckout(items, currency, value)
    }
    // Fire once per mount for this cart.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.id])

  return null
}
