import { Metadata } from "next"
import { Suspense } from "react"

import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/templates/paginated-products"

type Props = {
  params: Promise<{ slug?: string[] }>
}

// Static + ISR: the page reads no cookies and no searchParams on the server.
// Category/collection now come from the path (/ready-to-wear/<handle> or
// /ready-to-wear/<collection-handle>/<category-handle>); sort/price/color
// stay as query params, handled client-side — see StoreView / InfiniteProducts.
// The sidebar/header chrome lives in layout.tsx (a sibling, not this page),
// so switching category/collection only remounts this product grid, not the
// whole shell.
export const revalidate = 3600

export async function generateStaticParams() {
  const [categories, { collections }] = await Promise.all([
    listCategories(),
    listCollections(),
  ])

  return [
    { slug: [] },
    // Category handles can themselves contain slashes (Medusa nests a
    // subcategory's handle under its parent's, e.g. "accesorii/cravate") —
    // each must be split into its real path segments, or Next statically
    // builds the wrong (percent-encoded, single-segment) route and falls
    // back to an on-demand render for the actual nested URL.
    ...categories.map((c) => ({ slug: c.handle.split("/") })),
    ...collections.map((c) => ({ slug: [c.handle] })),
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  if (!slug?.length) {
    return {
      title: "Ready to Wear",
      description: "Explore all of our products.",
    }
  }

  const [categories, { collections }] = await Promise.all([
    listCategories(),
    listCollections(),
  ])

  // Category handles can span multiple path segments (nested subcategory
  // handles like "accesorii/cravate") — match the full remaining path
  // first, falling back to the last segment for a plain collection handle.
  const fullPath = slug.join("/")
  const lastHandle = slug[slug.length - 1]
  const category =
    categories.find((c) => c.handle === fullPath) ??
    categories.find((c) => c.handle === lastHandle)
  const collection = collections.find((c) => c.handle === lastHandle)
  const name = category?.name || collection?.title || "Ready to Wear"

  return {
    title: name,
    description: category?.description || "Explore all of our products.",
  }
}

export default async function StorePage() {
  return (
    <Suspense fallback={<SkeletonProductGrid />}>
      <PaginatedProducts sortBy="created_at" countryCode={"ro"} urlFiltered />
    </Suspense>
  )
}
