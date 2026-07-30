"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export const listCartShippingMethods = async (cartId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("fulfillment")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreShippingOptionListResponse>(
      `/store/shipping-options`,
      {
        method: "GET",
        query: {
          cart_id: cartId,
          // +data exposes the provider option payload (eAWB carrier_id /
          // service_id) — the checkout uses service_id to detect locker
          // delivery structurally instead of parsing the option name.
          fields: "+data",
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ shipping_options }) => shipping_options)
    .catch(() => {
      return null
    })
}

// Fetches live courier prices for ALL eAWB calculated options in one request
// (the backend queries Europarcel once), keyed by shipping_option id.
export const listEawbShippingPrices = async (
  cartId: string
): Promise<Record<string, number>> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  // Deliberately no .catch(() => ({})) here — an empty object is
  // indistinguishable from "no courier serves this address", and the caller
  // caches that result per cart+address. Swallowing a transient error into
  // {} used to get permanently cached as "no coverage" until the cart id
  // changed (e.g. after clearing cookies). Let it throw; the caller decides
  // whether to show an error and must NOT cache a thrown/failed attempt.
  return sdk.client
    .fetch<{ prices: Record<string, number> }>(`/store/eawb/shipping-prices`, {
      method: "GET",
      query: { cart_id: cartId },
      headers,
      cache: "no-store",
    })
    .then(({ prices }) => prices ?? {})
}

export type EawbLocker = {
  id: number
  name: string
  address: string
  lat: number | null
  lng: number | null
}

// Lists lockers available for a given eAWB shipping option near the cart's
// delivery locality (used by the checkout locker picker).
export const listEawbLockers = async (
  optionId: string,
  cartId: string
): Promise<EawbLocker[]> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{ lockers: EawbLocker[] }>(`/store/eawb/lockers`, {
      method: "GET",
      query: { option_id: optionId, cart_id: cartId },
      headers,
      cache: "no-store",
    })
    .then(({ lockers }) => lockers ?? [])
    .catch(() => [])
}

export const calculatePriceForShippingOption = async (
  optionId: string,
  cartId: string,
  data?: Record<string, unknown>
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("fulfillment")),
  }

  const body = { cart_id: cartId, data }

  if (data) {
    body.data = data
  }

  return sdk.client
    .fetch<{ shipping_option: HttpTypes.StoreCartShippingOption }>(
      `/store/shipping-options/${optionId}/calculate`,
      {
        method: "POST",
        body,
        headers,
        next,
      }
    )
    .then(({ shipping_option }) => shipping_option)
    .catch((_e) => {
      return null
    })
}
