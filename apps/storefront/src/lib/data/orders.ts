"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getMedusaLocaleHeaders } from "@lib/util/request-locale"
import { HttpTypes } from "@medusajs/types"

export const retrieveOrder = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
    // Without this, `items.variant.product.title` (the live relation the
    // order item component prefers over its frozen product_title snapshot)
    // always comes back in the base locale (Romanian) — this page renders
    // inside [locale]'s tree, so getRequestLocaleValue() already has it,
    // no override needed (contrast with cart.ts's Server Actions, invoked
    // directly from Client Components outside any route render).
    ...getMedusaLocaleHeaders(),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
      method: "GET",
      query: {
        // The order item's own thumbnail is just the product's generic
        // image and ignores which variant (e.g. color) was ordered — the
        // detail page resolves the real image via getCartItemImageUrl,
        // which needs this same deep variant/product tree the cart fetches
        // (see retrieveCart in ./cart.ts).
        fields:
          "*payment_collections.payments,*items,*items.metadata,*items.variant,+items.variant.thumbnail,*items.variant.images,*items.variant.product,+items.variant.product.thumbnail,*items.variant.product.images,+items.variant.product.options,+items.variant.product.options.values,*items.variant.product.variants,*items.variant.product.variants.options,*items.product",
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
}

// Order detail URLs use the human-friendly display_id (/profil/comenzi/148)
// instead of the internal order_… id. The store API can't fetch by
// display_id directly, so we scan the customer's own orders for it (cheap:
// almost no customer exceeds one page), then load the full order by id.
export const retrieveOrderByDisplayId = async (displayId: string) => {
  const wanted = Number(displayId)

  if (!Number.isInteger(wanted) || wanted <= 0) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
    ...getMedusaLocaleHeaders(),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  const pageSize = 100
  for (let offset = 0; ; offset += pageSize) {
    const { orders, count } = await sdk.client
      .fetch<HttpTypes.StoreOrderListResponse>(`/store/orders`, {
        method: "GET",
        query: {
          limit: pageSize,
          offset,
          order: "-created_at",
          fields: "id,display_id",
        },
        headers,
        next,
        cache: "force-cache",
      })
      .catch((err) => medusaError(err))

    const match = orders.find((o) => o.display_id === wanted)
    if (match) {
      return retrieveOrder(match.id)
    }

    if (offset + pageSize >= count) {
      return null
    }
  }
}

export const listOrders = async (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, unknown>
) => {
  const headers = {
    ...(await getAuthHeaders()),
    ...getMedusaLocaleHeaders(),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderListResponse>(`/store/orders`, {
      method: "GET",
      query: {
        limit,
        offset,
        order: "-created_at",
        fields: "*items,+items.metadata,*items.variant,*items.product",
        ...filters,
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ orders }) => orders)
    .catch((err) => medusaError(err))
}

export const createTransferRequest = async (
  state: {
    success: boolean
    error: string | null
    order: HttpTypes.StoreOrder | null
  },
  formData: FormData
): Promise<{
  success: boolean
  error: string | null
  order: HttpTypes.StoreOrder | null
}> => {
  const id = formData.get("order_id") as string

  if (!id) {
    return { success: false, error: "Order ID is required", order: null }
  }

  const headers = await getAuthHeaders()

  return await sdk.store.order
    .requestTransfer(
      id,
      {},
      {
        fields: "id, email",
      },
      headers
    )
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const acceptTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .acceptTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const declineTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .declineTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}
