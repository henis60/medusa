import { Suspense } from "react"
import { HttpTypes } from "@medusajs/types"

import {
  listCollections,
  getCollectionWithProductCategories,
} from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import StoreView from "@modules/store/components/store-view"

// Static + ISR: fetches the collection/category lists with cookie-free,
// tag-cached calls. This is a LAYOUT (not the page) so it persists across
// category/collection navigation — only the page segment (the product grid)
// remounts when the URL's dynamic slug changes. Previously this all lived in
// the page itself, so every category/collection click threw away and
// rebuilt the whole sidebar/header (scroll position, open dropdowns,
// animations) even though none of it actually depends on the slug — it
// looked like the entire page was reloading.
export const revalidate = 3600

export default async function ReadyToWearLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [{ collections }, categories] = await Promise.all([
    listCollections(),
    listCategories(),
  ])

  // Every collection's subcategories, fetched up front (cached, revalidated
  // hourly like everything else on this page) so selecting a collection on
  // the client is a synchronous lookup — same as plain categories — instead
  // of an on-demand fetch. That on-demand fetch was the actual source of the
  // "glitch": no matter how the loading state was animated, there was always
  // a network gap where the previous collection's subcategories were either
  // still showing (wrong) or being swapped out (visible flicker).
  const categoriesWithChildren = new Set(
    categories
      .filter((c) => (c.category_children?.length ?? 0) > 0)
      .map((c) => c.id)
  )
  const collectionCategoriesEntries = await Promise.all(
    collections.map(async (c) => {
      const full = await getCollectionWithProductCategories(c.id)
      const seen = new Set<string>()
      const cats: HttpTypes.StoreProductCategory[] = []
      for (const product of full?.products ?? []) {
        for (const cat of (product as any).categories ?? []) {
          if (!seen.has(cat.id) && !categoriesWithChildren.has(cat.id)) {
            seen.add(cat.id)
            cats.push(cat)
          }
        }
      }
      return [c.id, cats] as const
    })
  )
  const collectionCategoriesMap = Object.fromEntries(
    collectionCategoriesEntries
  )

  return (
    // Suspense around StoreView: it reads useSearchParams client-side, which
    // must sit under a boundary for the layout to prerender statically.
    <Suspense>
      <StoreView
        collections={collections}
        categories={categories}
        collectionCategoriesMap={collectionCategoriesMap}
      >
        {children}
      </StoreView>
    </Suspense>
  )
}
