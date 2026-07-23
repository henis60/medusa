"use client"

import { useEffect, useState } from "react"
import { getCartChrome, CartChrome } from "@lib/data/cart-chrome"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

/**
 * Personalized layout chrome (cart mismatch banner + free shipping nudge),
 * fetched client-side after hydration so pages stay static/ISR: the server
 * render reads no cookies and costs no API calls.
 */
export default function CartPersonalization() {
  const [chrome, setChrome] = useState<CartChrome | null>(null)

  useEffect(() => {
    let cancelled = false
    getCartChrome()
      .then((data) => !cancelled && setChrome(data))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!chrome?.cart) {
    return null
  }

  return (
    <>
      {chrome.customer && (
        <CartMismatchBanner customer={chrome.customer} cart={chrome.cart} />
      )}
      <FreeShippingPriceNudge
        variant="popup"
        cart={chrome.cart}
        shippingOptions={chrome.shippingOptions}
      />
    </>
  )
}
