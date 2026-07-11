"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import { listProductsWithSort } from "@lib/data/products"
import ProductPreview from "@modules/products/components/product-preview"
import AnimatedProductCard from "@modules/store/components/animated-product-card"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  initialProducts: HttpTypes.StoreProduct[]
  /** Total product count from the API — drives hasMore. */
  count: number
  region: HttpTypes.StoreRegion
  countryCode: string
  limit: number
  /** Sort the server rendered the initial batch with. */
  initialSort: SortOptions
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  /**
   * When true (the /store page), collection/category come from the URL
   * client-side and changes trigger a refetch. Category/collection pages
   * keep their fixed props instead.
   */
  urlFiltered?: boolean
}

/**
 * Continuous loading product grid. The server renders the first batch
 * (static/ISR-friendly); this component appends more via the
 * listProductsWithSort server action when the sentinel scrolls into view,
 * and refetches from page 1 when ?sortBy= changes client-side.
 */
export default function InfiniteProducts({
  initialProducts,
  count,
  region,
  countryCode,
  limit,
  initialSort,
  collectionId,
  categoryId,
  productsIds,
  urlFiltered = false,
}: Props) {
  const searchParams = useSearchParams()
  const sortBy = (searchParams.get("sortBy") as SortOptions) || "created_at"
  // On /store the filters live in the URL; on category/collection pages
  // they're fixed props baked into the static page.
  const effectiveCollectionId = urlFiltered
    ? searchParams.get("collection") ?? undefined
    : collectionId
  const effectiveCategoryId = urlFiltered
    ? searchParams.get("category") ?? undefined
    : categoryId

  // Filters the server-rendered `initialProducts` were fetched with (always
  // the unfiltered defaults on /store, since that page is static).
  const initialFiltersKey = JSON.stringify([initialSort, collectionId, categoryId])
  // Refetch from page 1 when the URL-driven filters (sort, collection,
  // category) differ from what the current list was fetched with — covers
  // user changes and landing directly on a filtered URL whose static HTML
  // used the defaults.
  const filtersKey = JSON.stringify([
    sortBy,
    effectiveCollectionId,
    effectiveCategoryId,
  ])
  // True when the URL already asks for a different view than what got
  // server-rendered (e.g. a hard reload of /store?category=x). In that case
  // we must NOT paint `initialProducts` even for a single frame — that's the
  // wrong (unfiltered) catalog — so the very first render starts empty +
  // loading instead, and the effect below fetches the correct page 1.
  const needsInitialRefetch = filtersKey !== initialFiltersKey

  const [products, setProducts] = useState(() =>
    needsInitialRefetch ? [] : initialProducts
  )
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(needsInitialRefetch)
  const [hasMore, setHasMore] = useState(() =>
    needsInitialRefetch ? true : initialProducts.length < count
  )
  const activeFilters = useRef<string>(
    needsInitialRefetch ? "" : initialFiltersKey
  )
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const buildQueryParams = useCallback(
    () => ({
      limit,
      ...(effectiveCollectionId
        ? { collection_id: [effectiveCollectionId] }
        : {}),
      ...(effectiveCategoryId ? { category_id: [effectiveCategoryId] } : {}),
      ...(productsIds ? { id: productsIds } : {}),
    }),
    [limit, effectiveCollectionId, effectiveCategoryId, productsIds]
  )
  useEffect(() => {
    if (filtersKey === activeFilters.current) return
    let cancelled = false
    setLoading(true)
    listProductsWithSort({
      page: 1,
      queryParams: buildQueryParams(),
      sortBy,
      countryCode,
    })
      .then(({ response }) => {
        if (cancelled) return
        activeFilters.current = filtersKey
        setProducts(response.products)
        setPage(1)
        setHasMore(response.products.length < response.count)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [filtersKey, sortBy, buildQueryParams, countryCode])

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return
    // Don't append while the displayed list doesn't match the URL filters —
    // the refetch effect above is about to replace it from page 1.
    if (filtersKey !== activeFilters.current) return
    setLoading(true)
    const nextPage = page + 1
    listProductsWithSort({
      page: nextPage,
      queryParams: buildQueryParams(),
      sortBy,
      countryCode,
    })
      .then(({ response }) => {
        setProducts((prev) => {
          // Guard against duplicates if a product shifted between pages.
          const seen = new Set(prev.map((p) => p.id))
          const fresh = response.products.filter((p) => !seen.has(p.id))
          const merged = [...prev, ...fresh]
          setHasMore(merged.length < response.count && fresh.length > 0)
          return merged
        })
        setPage(nextPage)
      })
      .finally(() => setLoading(false))
  }, [loading, hasMore, page, filtersKey, sortBy, buildQueryParams, countryCode])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: "600px 0px" }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore, hasMore])

  return (
    <>
      <div className="-mx-4 small:mx-0">
        <ul
          className="grid grid-cols-2 w-full small:grid-cols-2 medium:grid-cols-3 gap-[4px] small:gap-x-8 small:gap-y-16"
          data-testid="products-list"
        >
          {products.map((p, i) => (
            <AnimatedProductCard key={p.id} index={i}>
              <ProductPreview product={p} region={region} />
            </AnimatedProductCard>
          ))}
        </ul>
      </div>

      {hasMore && <div ref={sentinelRef} aria-hidden className="h-px" />}

      {loading && (
        <div className="flex justify-center py-10">
          <span className="font-sans text-[10px] uppercase tracking-[4px] text-[var(--theme-text-muted)] animate-pulse">
            Se încarcă…
          </span>
        </div>
      )}
    </>
  )
}
