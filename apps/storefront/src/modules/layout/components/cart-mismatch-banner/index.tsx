"use client"

import { transferCart } from "@lib/data/customer"
import { StoreCart, StoreCustomer } from "@medusajs/types"
import { useEffect, useRef } from "react"

/**
 * When a logged-in customer ends up with a cart that isn't associated to their
 * account (e.g. a guest cart created before login), it needs to be transferred.
 * Rather than surfacing this as an error banner the user has to act on, we run
 * the transfer silently. It retries once per mount (i.e. per navigation) if it
 * fails, and never renders any UI.
 */
function CartMismatchBanner(props: {
  customer: StoreCustomer
  cart: StoreCart
}) {
  const { customer, cart } = props
  const attempted = useRef(false)

  const needsTransfer = !!customer && !cart.customer_id

  useEffect(() => {
    if (!needsTransfer || attempted.current) {
      return
    }
    attempted.current = true

    transferCart().catch(() => {
      // Silent: the cart still functions for checkout, and the transfer is
      // retried on the next navigation. Never block or alarm the user.
    })
  }, [needsTransfer])

  return null
}

export default CartMismatchBanner
