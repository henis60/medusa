import { Suspense } from "react"

import { listCollections } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import StoreView from "@modules/store/components/store-view"

import PaginatedProducts from "./paginated-products"

/**
 * Server side of the store page. Fetches the collection/category lists with
 * cookie-free, tag-cached calls and renders the default (unfiltered) product
 * grid — all static/ISR-friendly. URL filters (collection / category /
 * sortBy) are applied client-side by StoreView + InfiniteProducts.
 */
const StoreTemplate = async ({ countryCode }: { countryCode: string }) => {
  const [{ collections }, categories] = await Promise.all([
    listCollections(),
    listCategories(),
  ])

  return (
    // Suspense around StoreView: it reads useSearchParams client-side, which
    // must sit under a boundary for the page to prerender statically.
    <Suspense>
      <StoreView collections={collections} categories={categories}>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy="created_at"
            countryCode={countryCode}
            urlFiltered
          />
        </Suspense>
      </StoreView>
    </Suspense>
  )
}

export default StoreTemplate
