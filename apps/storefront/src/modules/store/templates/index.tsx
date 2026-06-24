import { Suspense } from "react"

import { listCollections } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import FilterDrawer from "@modules/store/components/filter-drawer"
import StoreSidebar from "@modules/store/components/store-sidebar"
import CategoryPills from "@modules/store/components/category-pills"
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

  const activeCollection = collections.find((c) => c.id === collectionId)
  const activeCategory = categories.find((c) => c.id === categoryId)
  const heading =
    activeCategory?.name || activeCollection?.title || "Toate produsele"

  return (
    <div className="bg-[var(--theme-bg)] w-full min-h-screen">
      {/* Hero header */}
      <div className="border-b border-[var(--theme-border)]">
        <div className="content-container pt-6 pb-5 small:pt-10 small:pb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-hunter-gold" />
            <span className="font-sans text-[10px] uppercase tracking-[5px] text-[var(--theme-text-muted)]">
              Magazin
            </span>
          </div>
          <h1
            data-testid="store-page-title"
            className="font-display text-4xl small:text-6xl text-[var(--theme-text)] leading-[0.95]"
          >
            {heading === "Toate produsele" ? (
              <>
                Toate <span className="italic text-hunter-gold">produsele</span>
              </>
            ) : (
              heading
            )}
          </h1>
          <p className="mt-4 max-w-md font-serif text-lg text-[var(--theme-text-muted)] leading-relaxed">
            Piese selectate cu grijă — cămăși, accesorii și colecții pentru
            garderoba ta.
          </p>
        </div>
      </div>

      {/* Mobile filter + sort bar */}
      <div className="small:hidden border-b border-[var(--theme-border)]">
        <div className="content-container py-3 flex items-center justify-between gap-3">
          <FilterDrawer
            collections={collections}
            categories={categories}
            sortBy={sort}
            selectedCollection={collectionId}
            selectedCategory={categoryId}
          />
        </div>
      </div>

      {/* Mobile categories — horizontally scrollable */}
      <CategoryPills categories={categories} selectedCategory={categoryId} />

      {/* Two-column shop layout */}
      <div className="content-container py-10 small:py-14">
        <div className="flex gap-10 small:gap-14" data-testid="category-container">
          <StoreSidebar
            collections={collections}
            categories={categories}
            sortBy={sort}
            selectedCollection={collectionId}
            selectedCategory={categoryId}
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
