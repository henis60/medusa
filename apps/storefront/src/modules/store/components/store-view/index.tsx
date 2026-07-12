"use client"

import { ReactNode, useCallback, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import StoreSidebar from "@modules/store/components/store-sidebar"
import CategoryPills from "@modules/store/components/category-pills"
import StoreSortSelect from "@modules/store/components/store-sort-select"
import ExpandableDescription from "@modules/store/components/expandable-description"
import DesktopFilterDrawer from "@modules/store/components/desktop-filter-drawer"
import {
  StoreFacetsProvider,
  StoreFacets,
} from "@modules/store/context/store-facets-context"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  collections: HttpTypes.StoreCollection[]
  categories: HttpTypes.StoreProductCategory[]
  /** Every collection's subcategories, precomputed server-side (see
   *  templates/index.tsx) so selecting a collection is a synchronous lookup
   *  — no client fetch, no loading gap, no glitch. */
  collectionCategoriesMap: Record<string, HttpTypes.StoreProductCategory[]>
  children: ReactNode
}

/**
 * Client shell for the store page. The page itself is static (no cookies, no
 * server searchParams) — this component derives the selected collection /
 * category / sort from the URL on the client and drives the chrome (heading,
 * pills, sidebar). The product grid refetches client-side in
 * InfiniteProducts using the same URL params.
 */
export default function StoreView({
  collections,
  categories,
  collectionCategoriesMap,
  children,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlCollectionId = searchParams.get("collection") ?? undefined
  const urlCategoryId = searchParams.get("category") ?? undefined
  const sort = (searchParams.get("sortBy") as SortOptions) || "created_at"

  // Optimistic mirror of collection/category — updated synchronously on
  // click, before router.push. The nav (mobile pills + desktop sidebar)
  // reads these instead of the raw URL, so highlighting/subcategory reveal
  // never waits on however long the navigation transition takes to commit.
  // Synced back from the URL for anything that changes it externally
  // (back/forward, direct links).
  const [collectionId, setCollectionId] = useState(urlCollectionId)
  const [categoryId, setCategoryId] = useState(urlCategoryId)
  useEffect(() => setCollectionId(urlCollectionId), [urlCollectionId])
  useEffect(() => setCategoryId(urlCategoryId), [urlCategoryId])

  const pushParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams)
      mutate(params)
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const selectCategory = useCallback(
    (id: string | null) => {
      setCategoryId(id ?? undefined)
      setCollectionId(undefined)
      pushParams((params) => {
        params.delete("collection")
        if (id) params.set("category", id)
        else params.delete("category")
      })
    },
    [pushParams]
  )

  const selectCollection = useCallback(
    (id: string | null) => {
      setCollectionId(id ?? undefined)
      setCategoryId(undefined)
      pushParams((params) => {
        params.delete("category")
        if (id) params.set("collection", id)
        else params.delete("collection")
      })
    },
    [pushParams]
  )

  const selectCollectionCategory = useCallback(
    (nextCollectionId: string, nextCategoryId: string | null) => {
      setCollectionId(nextCollectionId)
      setCategoryId(nextCategoryId ?? undefined)
      pushParams((params) => {
        params.set("collection", nextCollectionId)
        if (nextCategoryId) params.set("category", nextCategoryId)
        else params.delete("category")
      })
    },
    [pushParams]
  )

  const clearFilters = useCallback(() => {
    setCategoryId(undefined)
    setCollectionId(undefined)
    pushParams((params) => {
      params.delete("category")
      params.delete("collection")
    })
  }, [pushParams])

  // Precomputed server-side (see templates/index.tsx) — a synchronous
  // lookup, same as plain categories, so there's no fetch/loading gap at all
  // when switching collections.
  const collectionCategories = collectionId
    ? collectionCategoriesMap[collectionId] ?? []
    : []

  // Price/color facets, reported up from InfiniteProducts (deep in
  // `children`) so the desktop "Filtru" button next to Sort can use them.
  const [facets, setFacets] = useState<StoreFacets>({
    priceBounds: [0, 0],
    colorFacets: [],
  })

  const activeCollection = collections.find((c) => c.id === collectionId)
  const activeCategory = categories.find((c) => c.id === categoryId)
  const currentLabel =
    activeCategory?.name || activeCollection?.title || "Ready to Wear"

  return (
    <StoreFacetsProvider value={{ facets, setFacets }}>
      <div className="bg-[var(--theme-bg)] w-full min-h-screen">
        {/* Compact header — single title, no repetition */}
        <div className="border-b border-[var(--theme-border)]">
          <div className="page-container py-5 small:py-7">
            <h1
              data-testid="store-page-title"
              className="font-display text-2xl small:text-3xl text-[var(--theme-text)] leading-none"
            >
              {currentLabel}
            </h1>
            <ExpandableDescription
              className="mt-1.5 max-w-md"
              text={
                activeCategory?.description ||
                (activeCollection?.metadata?.description as string) ||
                "Piese selectate cu grijă — cămăși, accesorii și colecții pentru garderoba ta."
              }
            />
          </div>

          {/* Mobile — category/collection nav, close to the divider below */}
          <div className="page-container pb-4 pt-2 small:hidden">
            <CategoryPills
              categories={categories}
              collections={collections}
              selectedCategory={categoryId}
              selectedCollection={collectionId}
              collectionCategories={collectionCategories}
              onSelectCategory={selectCategory}
              onSelectCollection={selectCollection}
              onSelectCollectionCategory={selectCollectionCategory}
            />
          </div>
        </div>

        {/* Sort bar — desktop, between two dividers */}
        <div className="hidden small:block border-b border-[var(--theme-border)]">
          <div className="page-container flex items-center justify-between py-3">
            <DesktopFilterDrawer />
            <StoreSortSelect sortBy={sort} />
          </div>
        </div>

        {/* Two-column shop layout */}
        <div className="page-container py-0 small:py-12">
          <div
            className="flex gap-10 small:gap-14"
            data-testid="category-container"
          >
            <StoreSidebar
              collections={collections}
              categories={categories}
              sortBy={sort}
              selectedCollection={collectionId}
              selectedCategory={categoryId}
              collectionCategories={collectionCategories}
              onSelectCategory={selectCategory}
              onSelectCollection={selectCollection}
              onSelectCollectionCategory={selectCollectionCategory}
              onClearFilters={clearFilters}
            />

            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </StoreFacetsProvider>
  )
}
