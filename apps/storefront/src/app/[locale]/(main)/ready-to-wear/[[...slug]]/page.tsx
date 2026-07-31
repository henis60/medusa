import { Metadata } from "next"
import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { setRequestLocaleValue } from "@lib/util/request-locale"
import PaginatedProducts from "@modules/store/templates/paginated-products"

type Props = {
  params: Promise<{ slug?: string[]; locale: string }>
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
  const { slug, locale } = await params
  // generateMetadata is a separate invocation from the page component, so
  // it needs its own locale seed before fetching — see (main)/layout.tsx.
  setRequestLocaleValue(locale)
  const t = await getTranslations({ locale, namespace: "app" })

  if (!slug?.length) {
    return {
      title: t("Ready to Wear"),
      description: t("Explore all of our products"),
      // Sort/color/price filters are client-side query params, never part
      // of this path — canonical is always just the clean page itself, so
      // Google indexes one URL per category/collection instead of a
      // separate one per filter combination.
      alternates: { canonical: "/ready-to-wear" },
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
  const name = category?.name || collection?.title || t("Ready to Wear")

  return {
    title: name,
    description: category?.description || t("Explore all of our products"),
    // Same reasoning as the base page above: canonical is this
    // category/collection's own clean path (query-string filters excluded),
    // never the top-level shop — each one is distinct, indexable content.
    alternates: { canonical: `/ready-to-wear/${fullPath}` },
  }
}

export default async function StorePage({ params }: Props) {
  const { slug, locale } = await params
  // Next may render this page concurrently with its ancestor layouts (root
  // [locale]/layout.tsx included), so re-seed from this segment's own params
  // before the Promise.all below reads it — see (main)/layout.tsx.
  setRequestLocaleValue(locale)

  // Resolve the path's slug to a collection/category id HERE, server-side, so
  // the statically-generated HTML/RSC for each slug already contains the
  // CORRECT filtered products. Without this, every slug rendered the same
  // unfiltered catalog, so the client had to blank + skeleton + refetch the
  // first time it opened a category (InfiniteProducts.needsInitialRefetch) —
  // the first-visit-per-category flicker. Mirror of the slug→id logic in
  // StoreView / InfiniteProducts: a category handle can itself contain a slash
  // (nested subcategory), so match the whole remaining path first.
  //
  // IMPORTANT: PaginatedProducts must still render the SAME tree for every
  // slug (see its urlFiltered guard) — otherwise empty categories diverge the
  // subtree and Next falls back to a full reload on each switch.
  const [categories, { collections }] = await Promise.all([
    listCategories(),
    listCollections(),
  ])

  let collectionId: string | undefined
  let categoryId: string | undefined
  if (slug?.length) {
    const fullPath = slug.join("/")
    const cat = categories.find((c) => c.handle === fullPath)
    if (cat) {
      categoryId = cat.id
    } else if (slug.length === 1) {
      collectionId = collections.find((c) => c.handle === slug[0])?.id
    } else {
      collectionId = collections.find((c) => c.handle === slug[0])?.id
      categoryId = categories.find(
        (c) => c.handle === slug.slice(1).join("/")
      )?.id
    }
  }

  const categoryWithChildren = categoryId
    ? categories.find((c) => c.id === categoryId)
    : undefined

  // Suspense scopes the grid's own data-fetch suspension to just this
  // subtree. Without it, the fetch bubbles up to the nearest ancestor
  // Suspense boundary — the one in layout.tsx wrapping the ENTIRE StoreView
  // (title, sidebar, grid) — which has no fallback, so the whole page went
  // blank on every category/collection switch instead of just the grid.
  //
  // fallback={null} (not <SkeletonProductGrid />): the prefetch cache the
  // router relies on to avoid this fallback entirely doesn't always win the
  // race, and a full skeleton grid flashing in for a moment reads as more
  // jarring than a brief blank gap — InfiniteProducts already shows its own
  // lightweight inline loading state once it's mounted.
  return (
    <Suspense fallback={null}>
      <PaginatedProducts
        sortBy="created_at"
        countryCode={"ro"}
        urlFiltered
        collectionId={collectionId}
        categoryId={categoryId}
        categories={categories}
        collections={collections}
        categoryWithChildren={categoryWithChildren}
      />
    </Suspense>
  )
}
