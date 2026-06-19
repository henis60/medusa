import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const words = collection.title.split(" ")
  const last = words.pop()
  const rest = words.join(" ")

  return (
    <div className="bg-[var(--theme-bg)] w-full min-h-screen">
      {/* Header */}
      <div className="content-container pt-5 small:pt-10 pb-6">
        <h1
          data-testid="collection-page-title"
          className="font-display text-4xl small:text-5xl text-[var(--theme-text)] leading-none"
        >
          {rest && <>{rest} </>}
          <span className="italic text-hunter-gold">{last}</span>
        </h1>
      </div>

      {/* Sort bar */}
      <div className="border-y border-[var(--theme-border)]">
        <div className="content-container py-2.5 flex items-center justify-end">
          <RefinementList sortBy={sort} />
        </div>
      </div>

      {/* Product grid */}
      <div
        className="content-container py-10"
        data-testid="collection-container"
      >
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={collection.products?.length}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
