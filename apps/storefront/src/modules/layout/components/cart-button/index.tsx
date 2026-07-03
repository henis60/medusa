"use client"

import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { retrieveCart } from "@lib/data/cart"
import { onCartUpdated } from "@lib/util/cart-events"
import CartDropdown from "../cart-dropdown"

/**
 * Client-side cart badge: renders instantly with an empty cart and hydrates
 * the real cart after mount, so the nav can be part of a static/ISR shell
 * (no cookies read during server render). Refetches whenever a component
 * emits the cart:updated event (add/update/delete).
 */
export default function CartButton() {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)

  useEffect(() => {
    let cancelled = false

    const refetch = () => {
      retrieveCart()
        .then((data) => !cancelled && setCart(data))
        .catch(() => {})
    }

    refetch()
    const unsubscribe = onCartUpdated(refetch)

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  return <CartDropdown cart={cart} />
}
