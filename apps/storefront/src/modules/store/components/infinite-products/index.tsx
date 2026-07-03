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
}: Props) {
  const searchParams = useSearchParams()
  const sortBy = (searchParams.get("sortBy") as SortOptions) || "created_at"

  const [products, setProducts] = useState(initialProducts)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialProducts.length < count)
  // Sort the currently displayed list was fetched with.
  const activeSort = useRef<SortOptions>(initialSort)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const buildQueryParams = useCallback(
    () => ({
      limit,
      ...(collectionId ? { collection_id: [collectionId] } : {}),
      ...(categoryId ? { category_id: [categoryId] } : {}),
      ...(productsIds ? { id: productsIds } : {}),
    }),
    [limit, collectionId, categoryId, productsIds]
  )

  // Re-sort: refetch from page 1 when the sort in the URL differs from what
  // the current list was fetched with (covers both user changes and landing
  // directly on a ?sortBy= URL whose static HTML used the default sort).
  useEffect(() => {
    if (sortBy === activeSort.current) return
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
        activeSort.current = sortBy
        setProducts(response.products)
        setPage(1)
        setHasMore(response.products.length < response.count)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [sortBy, buildQueryParams, countryCode])

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return
    setLoading(true)
    const nextPage = page + 1
    listProductsWithSort({
      page: nextPage,
      queryParams: buildQueryParams(),
      sortBy: activeSort.current,
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
  }, [loading, hasMore, page, buildQueryParams, countryCode])

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
