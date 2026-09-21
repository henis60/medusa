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

// Identifies this server as the storefront to the backend's /store/eawb/*
// routes. Those routes expose a cart's delivery address and can't be gated on
// customer auth (guest checkout has no session), so they're restricted to
// callers holding this shared secret instead. Server-only — deliberately not
// NEXT_PUBLIC, since these run in server actions and the browser must never
// see it. When unset, the backend leaves the routes open, so checkout keeps
// working either way.
const internalHeaders = (): Record<string, string> => {
  const secret = process.env.EAWB_INTERNAL_SECRET
  return secret ? { "x-internal-secret": secret } : {}
}

export type EawbPricesResult =
  | { ok: true; prices: Record<string, number> }
  | {
      ok: false
      /** Europarcel rejected the address itself — retrying cannot help, the
       *  customer has to correct it. */
      reason: "address_rejected"
      detail?: string
    }
  | {
      ok: false
      /** Transient (courier down, rate limited, network) — retrying may work. */
      reason: "unavailable"
    }

// Fetches live courier prices for ALL eAWB calculated options in one request
// (the backend queries Europarcel once), keyed by shipping_option id.
//
// Still never reports failure as an empty price map — that is byte-for-byte
// identical to "no courier serves this address" and used to get cached as
// permanent "no coverage". But it no longer throws either: Next redacts errors
// thrown from a server action in production, so the client would receive only
// an opaque digest and could not tell a wrong address from a courier outage —
// which is exactly the distinction the caller now has to draw. Hence an
// explicit result union instead.
export const listEawbShippingPrices = async (
  cartId: string
): Promise<EawbPricesResult> => {
  const headers = {
    ...(await getAuthHeaders()),
    ...internalHeaders(),
  }

  try {
    const { prices } = await sdk.client.fetch<{
      prices: Record<string, number>
    }>(`/store/eawb/shipping-prices`, {
      method: "GET",
      query: { cart_id: cartId },
      headers,
      cache: "no-store",
    })
    return { ok: true, prices: prices ?? {} }
  } catch (error) {
    // 422 is the backend's signal that Europarcel judged the address data
    // itself (see the route's catch); anything else is treated as transient.
    const status = (error as { status?: number } | null)?.status
    if (status === 422) {
      return { ok: false, reason: "address_rejected" }
    }
    return { ok: false, reason: "unavailable" }
  }
}

export type EawbLocker = {
  id: number
  name: string
  address: string
  lat: number | null
  lng: number | null
}

export type EawbLockerOrigin = { lat: number; lng: number } | null

// Lists lockers available for a given eAWB shipping option near the cart's
// delivery locality (used by the checkout locker picker).
export const listEawbLockers = async (
  optionId: string,
  cartId: string
): Promise<EawbLocker[]> => {
  const headers = {
    ...(await getAuthHeaders()),
    ...internalHeaders(),
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

// Geocodes the cart's delivery street address, used to center the locker map
// precisely instead of just fitting to the returned lockers' bounds. Fetched
// separately from listEawbLockers so Nominatim's latency never blocks the
// locker list from rendering.
export const getEawbOrigin = async (cartId: string): Promise<EawbLockerOrigin> => {
  const headers = {
    ...(await getAuthHeaders()),
    ...internalHeaders(),
  }

  return sdk.client
    .fetch<{ origin: EawbLockerOrigin }>(`/store/eawb/geocode`, {
      method: "GET",
      query: { cart_id: cartId },
      headers,
      cache: "no-store",
    })
    .then(({ origin }) => origin ?? null)
    .catch(() => null)
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
