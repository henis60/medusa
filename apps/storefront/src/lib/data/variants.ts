"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

import { getAuthHeaders, getGlobalCacheOptions } from "./cookies"

export const retrieveVariant = async (
  variant_id: string
): Promise<HttpTypes.StoreProductVariant | null> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  // Variant data is not personalized — share one cache entry across visitors.
  const next = getGlobalCacheOptions("products")

  return await sdk.client
    .fetch<{ variant: HttpTypes.StoreProductVariant }>(
      `/store/product-variants/${variant_id}`,
      {
        method: "GET",
        query: {
          fields: "*images",
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ variant }) => variant)
    .catch(() => null)
}
