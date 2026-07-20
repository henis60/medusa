import { listProductsWithSort } from "@lib/data/products"
import { getRegionStatic } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import AnimatedGrid from "@modules/store/components/animated-grid"
import InfiniteProducts from "@modules/store/components/infinite-products"

const PRODUCT_LIMIT = 6

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
}

/**
 * Server-renders the first batch of products (static/ISR-friendly) and hands
 * off to the InfiniteProducts client component for continuous loading.
 */
export default async function PaginatedProducts({
  sortBy,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  urlFiltered = false,
  categories,
  collections,
  categoryWithChildren,
  collectionWithChildren,
}: {
  sortBy?: SortOptions
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  /** /ready-to-wear only: client applies collection/category from the URL path. */
  urlFiltered?: boolean
  /** Only needed when urlFiltered — resolves the path's handles back to ids. */
  categories?: HttpTypes.StoreProductCategory[]
  collections?: HttpTypes.StoreCollection[]
  categoryWithChildren?: HttpTypes.StoreProductCategory
  collectionWithChildren?: HttpTypes.StoreCollection
}) {
  const queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
  }

  if (collectionId) {
    // Collect collection + all its children recursively
    const collectionIds = [collectionId]
    const collectChildren = (col: HttpTypes.StoreCollection) => {
      if ((col as any).collections?.length) {
        (col as any).collections.forEach((child: HttpTypes.StoreCollection) => {
          collectionIds.push(child.id)
          collectChildren(child)
        })
      }
    }
    if (collectionWithChildren) {
      collectChildren(collectionWithChildren)
    }
    queryParams["collection_id"] = collectionIds
  }

  if (categoryId) {
    // Collect category + all its children recursively
    const categoryIds = [categoryId]
    const collectChildren = (cat: HttpTypes.StoreProductCategory) => {
      if (cat.category_children?.length) {
        cat.category_children.forEach((child) => {
          categoryIds.push(child.id)
          collectChildren(child)
        })
      }
    }

    // If categoryWithChildren is passed, use it; otherwise find it from categories list
    const catWithChildren = categoryWithChildren || categories?.find((c) => c.id === categoryId)
    if (catWithChildren) {
      collectChildren(catWithChildren)
    }
    queryParams["category_id"] = categoryIds
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  const sort = sortBy || "created_at"

  const region = await getRegionStatic(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page: 1,
    queryParams,
    sortBy: sort,
    countryCode,
  })

  if (products.length === 0) {
    // A fixed category/collection page (categoryId/collectionId baked into
    // the static page, no client-side facet UI) — this is genuinely an
    // empty category, not a filter combination returning zero results.
    const isFixedContext = !!collectionId || !!categoryId

    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <p className="font-sans text-[10px] uppercase tracking-[5px] text-[var(--theme-text-muted)]">
          Niciun produs găsit
        </p>
        <p className="font-serif text-lg text-[var(--theme-text-muted)] max-w-xs">
          {isFixedContext
            ? "Nu există produse în această categorie momentan."
            : "Combinația de filtre selectată nu returnează rezultate."}
        </p>
        <a
          href="/ready-to-wear"
          className="mt-2 px-8 py-3 font-sans text-[10px] uppercase tracking-[4px] border border-hunter-gold text-hunter-gold hover:bg-hunter-gold hover:text-hunter-dark transition-colors"
        >
          {isFixedContext ? "Vezi toate produsele" : "Resetează filtrele"}
        </a>
      </div>
    )
  }

  return (
    <AnimatedGrid>
      <InfiniteProducts
        initialProducts={products}
        count={count}
        region={region}
        countryCode={countryCode}
        limit={PRODUCT_LIMIT}
        initialSort={sort}
        collectionId={collectionId}
        categoryId={categoryId}
        categoryIds={queryParams.category_id}
        productsIds={productsIds}
        urlFiltered={urlFiltered}
        categories={categories}
        collections={collections}
      />
    </AnimatedGrid>
  )
}
