import { Suspense } from "react"

import { listCollections } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import FilterDrawer from "@modules/store/components/filter-drawer"
import FilterToggle from "@modules/store/components/filter-toggle"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

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

  const [{ collections }, categories] = await Promise.all([
    listCollections(),
    listCategories(),
  ])

  return (
    <div className="bg-[var(--theme-bg)] w-full min-h-screen">
      {/* Header */}
      <div className="content-container pt-5 pb-6 small:pt-20">
        <h1
          data-testid="store-page-title"
          className="font-display text-4xl small:text-5xl text-[var(--theme-text)] leading-none"
        >
          All <span className="italic text-hunter-gold">Products</span>
        </h1>
      </div>

      {/* Filter + sort bar */}
      <div className="border-y border-[var(--theme-border)]">
        <div className="content-container py-2 flex items-center justify-between gap-3">
          {/* Filter drawer — mobile + desktop */}
          <FilterDrawer
            collections={collections}
            categories={categories}
            sortBy={sort}
            selectedCollection={collectionId}
            selectedCategory={categoryId}
          />

          <div className="hidden small:block">
            <RefinementList sortBy={sort} />
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="content-container py-10" data-testid="category-container">
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
  )
}

export default StoreTemplate
