import { Suspense } from "react"
import { HttpTypes } from "@medusajs/types"

import {
  listCollections,
  getCollectionWithProductCategories,
} from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import StoreSidebar from "@modules/store/components/store-sidebar"
import CategoryPills from "@modules/store/components/category-pills"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import StoreSortSelect from "@modules/store/components/store-sort-select"
import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  collectionId,
  categoryId,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  collectionId?: string
  categoryId?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const [{ collections }, categories, collectionWithCats] = await Promise.all([
    listCollections(),
    listCategories(),
    collectionId
      ? getCollectionWithProductCategories(collectionId)
      : Promise.resolve(null),
  ])

  const categoriesWithChildren = new Set(
    categories
      .filter((c) => (c.category_children?.length ?? 0) > 0)
      .map((c) => c.id)
  )

  const collectionCategories: HttpTypes.StoreProductCategory[] = []
  if (collectionWithCats?.products) {
    const seen = new Set<string>()
    for (const product of collectionWithCats.products) {
      for (const cat of (product as any).categories ?? []) {
        if (!seen.has(cat.id) && !categoriesWithChildren.has(cat.id)) {
          seen.add(cat.id)
          collectionCategories.push(cat)
        }
      }
    }
  }

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

          <div className="flex-1 min-w-0">
            <Suspense fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                countryCode={countryCode}
                collectionId={collectionId}
                categoryId={categoryId}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
