import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default function CollectionTemplate({
  collection,
  countryCode,
}: {
  collection: HttpTypes.StoreCollection
  countryCode: string
}) {
  const words = collection.title.split(" ")
  const last = words.pop()
  const rest = words.join(" ")

  const description = (collection.metadata?.description as string) ?? null

  return (
    <div className="bg-[var(--theme-bg)] w-full min-h-screen">
      {/* Header */}
      <div className="page-container pt-10 pb-8 small:pt-16 small:pb-12 text-center">
        <h1
          data-testid="collection-page-title"
          className="font-display text-5xl small:text-7xl text-[var(--theme-text)] leading-none"
        >
          {rest && <>{rest} </>}
          <span className="italic text-hunter-gold">{last}</span>
        </h1>
        {description && (
          <p className="mt-6 mx-auto max-w-xl font-serif text-lg text-[var(--theme-text-muted)] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Product grid */}
      <div
        className="page-container py-5 small:py-10 border-t border-[var(--theme-border)]"
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
            sortBy="created_at"
            collectionId={collection.id}
            countryCode={countryCode}
            collectionWithChildren={collection}
          />
        </Suspense>
      </div>
    </div>
  )
}
