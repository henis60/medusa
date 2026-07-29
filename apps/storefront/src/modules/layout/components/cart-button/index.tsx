"use client"

import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { HttpTypes } from "@medusajs/types"
import { retrieveCart } from "@lib/data/cart"
import { onCartUpdated } from "@lib/util/cart-events"
import CartDropdown from "../cart-dropdown"

/**
 * Client-side cart badge: renders instantly with an empty cart and hydrates
 * the real cart after mount, so the nav can be part of a static/ISR shell
 * (no cookies read during server render).
 *
 * Updates on cart:updated events: if the event carries a cart payload
 * (optimistic copy or server-returned fresh cart) it's applied directly —
 * zero extra round-trips; otherwise it refetches.
 */
export default function CartButton() {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  // retrieveCart runs as a Server Action here, outside any page render — it
  // has no route [locale] param to read, so pass the client's current
  // locale explicitly (see request-locale.ts).
  const locale = useLocale()

  useEffect(() => {
    let cancelled = false

    const refetch = () => {
      retrieveCart(undefined, undefined, locale)
        .then((data) => !cancelled && setCart(data))
        .catch(() => {})
    }

    refetch()
    const unsubscribe = onCartUpdated((detail) => {
      if (detail.cart !== undefined) {
        if (!cancelled) setCart(detail.cart)
      } else {
        refetch()
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [locale])

  return <CartDropdown cart={cart} />
}
