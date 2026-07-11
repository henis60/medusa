"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import { getCollectionWithProductCategories } from "@lib/data/collections"
import StoreSidebar from "@modules/store/components/store-sidebar"
import CategoryPills from "@modules/store/components/category-pills"
import StoreSortSelect from "@modules/store/components/store-sort-select"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  collections: HttpTypes.StoreCollection[]
  categories: HttpTypes.StoreProductCategory[]
  children: ReactNode
}

/**
 * Client shell for the store page. The page itself is static (no cookies, no
 * server searchParams) — this component derives the selected collection /
 * category / sort from the URL on the client and drives the chrome (heading,
 * pills, sidebar). The product grid refetches client-side in
 * InfiniteProducts using the same URL params.
 */
export default function StoreView({ collections, categories, children }: Props) {
  const searchParams = useSearchParams()
  const collectionId = searchParams.get("collection") ?? undefined
  const categoryId = searchParams.get("category") ?? undefined
  const sort = (searchParams.get("sortBy") as SortOptions) || "created_at"

  const categoriesWithChildren = useMemo(
    () =>
      new Set(
        categories
          .filter((c) => (c.category_children?.length ?? 0) > 0)
          .map((c) => c.id)
      ),
    [categories]
  )

  // Sub-categories of the selected collection (for pills/sidebar), fetched
  // on demand via server action when a collection is selected.
  const [collectionCategories, setCollectionCategories] = useState<
    HttpTypes.StoreProductCategory[]
  >([])

  useEffect(() => {
    if (!collectionId) {
      setCollectionCategories([])
      return
    }
    let cancelled = false
    getCollectionWithProductCategories(collectionId)
      .then((collectionWithCats) => {
        if (cancelled || !collectionWithCats?.products) return
        const seen = new Set<string>()
        const cats: HttpTypes.StoreProductCategory[] = []
        for (const product of collectionWithCats.products) {
          for (const cat of (product as any).categories ?? []) {
            if (!seen.has(cat.id) && !categoriesWithChildren.has(cat.id)) {
              seen.add(cat.id)
              cats.push(cat)
            }
          }
        }
        setCollectionCategories(cats)
      })
      .catch(() => setCollectionCategories([]))
    return () => {
      cancelled = true
    }
  }, [collectionId, categoriesWithChildren])

  const activeCollection = collections.find((c) => c.id === collectionId)
  const activeCategory = categories.find((c) => c.id === categoryId)
  const heading =
    activeCategory?.name || activeCollection?.title || "Ready to wear"

  return (
    <div className="bg-[var(--theme-bg)] w-full min-h-screen">
      {/* Hero header */}
      <div className="border-b border-[var(--theme-border)]">
        <div className="relative page-container pt-6 pb-5 small:pt-10 small:pb-6">
          <div className="hidden small:block absolute bottom-0 right-0 translate-y-full py-3 px-10 z-10">
            <StoreSortSelect sortBy={sort} />
          </div>
          <h1
            data-testid="store-page-title"
            className="font-display text-3xl small:text-6xl text-[var(--theme-text)] leading-[0.95]"
          >
            {heading === "Ready to wear" ? (
              <>
                Ready to <span className="italic text-hunter-gold">wear</span>
              </>
            ) : (
              heading
            )}
          </h1>
          <p className="mt-2 small:mt-4 max-w-2xl font-serif text-sm small:text-lg text-[var(--theme-text-muted)] leading-relaxed line-clamp-2">
            {activeCategory?.description ||
              (activeCollection?.metadata?.description as string) ||
              "Piese selectate cu grijă — cămăși, accesorii și colecții pentru garderoba ta."}
          </p>
        </div>
      </div>

      {/* Mobile — horizontally scrollable chips: sort, collections, categories */}
      <CategoryPills
        categories={categories}
        collections={collections}
        selectedCategory={categoryId}
        selectedCollection={collectionId}
        sortBy={sort}
        collectionCategories={collectionCategories}
      />

      {/* Two-column shop layout */}
      <div className="page-container small:py-14">
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
          />

          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  )
}
