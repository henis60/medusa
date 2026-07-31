"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getMedusaLocaleHeaders } from "@lib/util/request-locale"
import { getGlobalCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
  includeProposed = false,
  locale,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
  includeProposed?: boolean
  /** Only needed when called as a Server Action from a Client Component
   *  (e.g. infinite scroll) — there's no route [locale] param to derive it
   *  from there, so pass the client's current locale (next-intl's
   *  useLocale()) explicitly. Server Components can omit it. */
  locale?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  // No auth headers here: public catalog listing depends only on the
  // publishable key + region (no customer-group pricing). Reading the JWT
  // cookie would force every caller (homepage, store) to render dynamically.
  const next = getGlobalCacheOptions("products")

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        headers: getMedusaLocaleHeaders(locale),
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+variants.metadata,*options,*options.values,+metadata,+tags,",
          ...queryParams,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null
      const published = products.filter((p) => {
        const status = (p as any).status
        if (includeProposed) return !["draft"].includes(status)
        return !["draft", "proposed"].includes(status)
      })

      return {
        response: {
          products: published,
          // API total, not the filtered page length — pagination needs the
          // full count. Slightly overcounts if drafts exist, acceptable.
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * Fetches full product data (with calculated prices + inventory) for a set
 * of product ids — used by the wishlist page, which only keeps id/handle/
 * title/thumbnail in localStorage and needs the rest fetched on demand.
 */
export const getProductsByIds = async ({
  ids,
  countryCode,
  locale,
}: {
  ids: string[]
  countryCode: string
  /** See listProducts — required when called from a Client Component. */
  locale?: string
}): Promise<HttpTypes.StoreProduct[]> => {
  if (!ids.length) return []

  const {
    response: { products },
  } = await listProducts({
    queryParams: { id: ids, limit: ids.length },
    countryCode,
    locale,
  })

  return products
}

/**
 * Paginated + sorted product listing.
 *
 * For the default created_at sort the API sorts and paginates for us, so we
 * fetch only the requested page. Price sorts still fetch 100 products and
 * sort in memory, because API-side ordering by cheapest variant price is
 * unreliable (medusajs/medusa#11029, #12900).
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
  locale,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
  /** See listProducts — required when called from a Client Component
   *  (this is invoked directly as a Server Action from infinite scroll). */
  locale?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  if (sortBy !== "price_asc" && sortBy !== "price_desc") {
    return listProducts({
      pageParam: Math.max(page, 1),
      queryParams: {
        ...queryParams,
        limit,
        order: "-created_at",
      },
      countryCode,
      locale,
    })
  }

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
    locale,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}

/**
 * Cookie-free single-product fetch for the (statically/ISR-rendered) product
 * detail page. No cookies → no DYNAMIC_SERVER_USAGE, so a product added after
 * the last build renders on-demand without a rebuild. Static tag + ISR.
 */
export const getProductByHandle = async (
  handle: string,
  regionId: string
): Promise<HttpTypes.StoreProduct | undefined> => {
  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[] }>(`/store/products`, {
      method: "GET",
      headers: getMedusaLocaleHeaders(),
      query: {
        handle,
        region_id: regionId,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,*categories",
      },
      next: { tags: ["products"], revalidate: 3600 },
      cache: "force-cache",
    })
    .then(({ products }) => products[0] ?? undefined)
}

/**
 * Cookie-free list of product handles for generateStaticParams (build-time
 * prerender), so the build reliably gets handles without reading cookies.
 */
export const listProductHandles = async (
  regionId: string
): Promise<string[]> => {
  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[] }>(`/store/products`, {
      method: "GET",
      query: { limit: 100, fields: "handle", region_id: regionId },
      next: { tags: ["products"], revalidate: 3600 },
      cache: "force-cache",
    })
    .then(({ products }) =>
      products.map((p) => p.handle).filter((h): h is string => Boolean(h))
    )
    .catch(() => [])
}
