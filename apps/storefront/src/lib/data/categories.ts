import { sdk } from "@lib/config"
import { getMedusaLocaleHeaders } from "@lib/util/request-locale"
import { HttpTypes } from "@medusajs/types"
import { getGlobalCacheOptions } from "./cookies"

export const listCategories = async (query?: Record<string, unknown>) => {
  const next = getGlobalCacheOptions("categories")

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        headers: getMedusaLocaleHeaders(),
        query: {
          // +metadata: the nav menu decides what to show via metadata flags
          // (see side-menu/index.tsx) rather than matching on category name,
          // which breaks under any locale but the one those names were
          // typed in.
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category, +metadata",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = getGlobalCacheOptions("categories")

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        headers: getMedusaLocaleHeaders(),
        query: {
          fields: "*category_children, *products",
          handle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(
      ({ product_categories }) =>
        product_categories[0] as HttpTypes.StoreProductCategory
    )
}
