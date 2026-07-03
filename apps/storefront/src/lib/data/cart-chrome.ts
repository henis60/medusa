"use server"

import { HttpTypes, StoreCartShippingOption } from "@medusajs/types"
import { listCartOptions, retrieveCart } from "./cart"
import { retrieveCustomer } from "./customer"

export type CartChrome = {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  shippingOptions: StoreCartShippingOption[]
}

/**
 * One round-trip for all personalized layout chrome (cart banner, free
 * shipping nudge, cart badge). Called from the client after hydration so
 * the page shell itself stays static/ISR and reads no cookies at render.
 */
export async function getCartChrome(): Promise<CartChrome> {
  const [customer, cart] = await Promise.all([
    retrieveCustomer(),
    retrieveCart(),
  ])

  if (!cart) {
    return { customer, cart: null, shippingOptions: [] }
  }

  const { shipping_options } = await listCartOptions()

  return { customer, cart, shippingOptions: shipping_options ?? [] }
}
