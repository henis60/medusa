"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import { listProductsWithSort } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { getProductColors } from "@lib/util/product-colors"
import ProductPreview from "@modules/products/components/product-preview"
import AnimatedProductCard from "@modules/store/components/animated-product-card"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreResultsBar, { ViewMode } from "@modules/store/components/store-results-bar"
import { useSetStoreFacets } from "@modules/store/context/store-facets-context"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"

function SkeletonCard() {
  return (
    <li>
      <SkeletonProductPreview />
    </li>
  )
}

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
   * When true (the /ready-to-wear page), collection/category come from the
   * URL path client-side and changes trigger a refetch. Category/collection
   * pages keep their fixed props instead.
   */
  urlFiltered?: boolean
  /** Only needed when urlFiltered — resolves the path's handles back to ids. */
  categories?: HttpTypes.StoreProductCategory[]
  collections?: HttpTypes.StoreCollection[]
}

const STORE_BASE_PATH = "/ready-to-wear"

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
  categories = [],
  collections = [],
}: Props) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [view, setView] = useState<ViewMode>("grid")
  const sortBy = (searchParams.get("sortBy") as SortOptions) || "created_at"
  // On /ready-to-wear, collection/category come from the path
  // (/ready-to-wear/<handle> or /ready-to-wear/<collection>/<category>) and
  // are resolved back to ids here; on fixed category/collection pages
  // they're just the static props baked into the page.
  let effectiveCollectionId = collectionId
  let effectiveCategoryId = categoryId
  if (urlFiltered) {
    const slug = pathname.startsWith(STORE_BASE_PATH)
      ? pathname.slice(STORE_BASE_PATH.length).split("/").filter(Boolean)
      : []
    effectiveCollectionId = undefined
    effectiveCategoryId = undefined
    if (slug.length === 1) {
      const cat = categories.find((c) => c.handle === slug[0])
      if (cat) {
        effectiveCategoryId = cat.id
      } else {
        effectiveCollectionId = collections.find((c) => c.handle === slug[0])?.id
      }
    } else if (slug.length >= 2) {
      effectiveCollectionId = collections.find((c) => c.handle === slug[0])?.id
      effectiveCategoryId = categories.find((c) => c.handle === slug[1])?.id
    }
  }

  // Price/color facets — client-side only (the API has no support for
  // these filters), applied on top of whatever's been loaded so far.
  const minPrice = urlFiltered ? Number(searchParams.get("minPrice")) || undefined : undefined
  const maxPrice = urlFiltered ? Number(searchParams.get("maxPrice")) || undefined : undefined
  const selectedColors = urlFiltered
    ? (searchParams.get("color") ?? "").split(",").filter(Boolean)
    : []

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
  // server-rendered (e.g. a hard reload of /ready-to-wear/costume). In that case
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
  // Total product count for whatever's currently selected — the `count` prop
  // is only the server-rendered default (unfiltered) total, so it must be
  // replaced with the refetch's own count once a category/collection filter
  // changes it, otherwise the displayed number never updates.
  const [totalCount, setTotalCount] = useState(count)
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
        setTotalCount(response.count)
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

  // Distinct colors across everything loaded so far — grows as more pages
  // load. Only relevant on /store, where the Filtre sheet shows them.
  const colorFacets = useMemo(() => {
    if (!urlFiltered) return []
    const seen = new Set<string>()
    for (const p of products) {
      for (const { label } of getProductColors(p)) seen.add(label)
    }
    return Array.from(seen)
  }, [products, urlFiltered])

  // Price bounds across everything loaded so far — drives the slider range.
  const priceBounds = useMemo((): [number, number] => {
    if (!urlFiltered) return [0, 0]
    let lo = Infinity
    let hi = 0
    for (const p of products) {
      const price = getProductPrice({ product: p }).cheapestPrice?.calculated_price_number
      if (price === undefined) continue
      if (price < lo) lo = price
      if (price > hi) hi = price
    }
    return lo === Infinity ? [0, 0] : [Math.floor(lo), Math.ceil(hi)]
  }, [products, urlFiltered])

  // Report facets up to StoreView (via context) so the desktop "Filtru"
  // button — rendered next to Sort, outside this subtree — can show them.
  const setStoreFacets = useSetStoreFacets()
  useEffect(() => {
    if (!urlFiltered) return
    setStoreFacets({ priceBounds, colorFacets })
  }, [urlFiltered, priceBounds, colorFacets, setStoreFacets])

  const hasFacetFilter = !!minPrice || !!maxPrice || selectedColors.length > 0

  // Price/color aren't supported by the API — filtered client-side over
  // whatever's been loaded via infinite scroll so far.
  const displayedProducts = useMemo(() => {
    if (!hasFacetFilter) return products
    return products.filter((p) => {
      if (minPrice || maxPrice) {
        const price = getProductPrice({ product: p }).cheapestPrice?.calculated_price_number
        if (price === undefined) return false
        if (minPrice && price < minPrice) return false
        if (maxPrice && price > maxPrice) return false
      }
      if (selectedColors.length > 0) {
        const productColors = getProductColors(p).map((c) => c.label)
        if (!selectedColors.some((c) => productColors.includes(c))) return false
      }
      return true
    })
  }, [products, hasFacetFilter, minPrice, maxPrice, selectedColors])

  return (
    <>
      {urlFiltered && (
        <StoreResultsBar
          count={hasFacetFilter ? displayedProducts.length : totalCount}
          loading={loading && filtersKey !== activeFilters.current}
          view={view}
          onViewChange={setView}
          colorFacets={colorFacets}
          priceBounds={priceBounds}
        />
      )}

      <div>
        <ul
          className={
            view === "list"
              ? "grid grid-cols-1 w-full small:grid-cols-2 medium:grid-cols-3 gap-y-8 small:gap-x-8 small:gap-y-16"
              : "grid grid-cols-2 w-full small:grid-cols-2 medium:grid-cols-3 gap-x-3 gap-y-8 small:gap-x-8 small:gap-y-16"
          }
          data-testid="products-list"
        >
          {displayedProducts.map((p, i) => (
            <AnimatedProductCard key={p.id} index={i}>
              <ProductPreview product={p} region={region} />
            </AnimatedProductCard>
          ))}
          {loading &&
            Array.from({ length: products.length === 0 ? 6 : 3 }).map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} />
            ))}
        </ul>
      </div>

      {hasFacetFilter && displayedProducts.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
          <p className="font-serif text-base text-[var(--theme-text-muted)]">
            Niciun produs nu corespunde filtrelor selectate.
          </p>
        </div>
      )}

      {hasMore && <div ref={sentinelRef} aria-hidden className="h-px" />}
    </>
  )
}
