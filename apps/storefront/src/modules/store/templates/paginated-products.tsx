import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import AnimatedProductCard from "@modules/store/components/animated-product-card"
import AnimatedGrid from "@modules/store/components/animated-grid"

const PRODUCT_LIMIT = 6

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <p className="font-sans text-[10px] uppercase tracking-[5px] text-[var(--theme-text-muted)]">
          Niciun produs găsit
        </p>
        <p className="font-serif text-lg text-[var(--theme-text-muted)] max-w-xs">
          Combinația de filtre selectată nu returnează rezultate.
        </p>
        <a
          href="/store"
          className="mt-2 px-8 py-3 font-sans text-[10px] uppercase tracking-[4px] border border-hunter-gold text-hunter-gold hover:bg-hunter-gold hover:text-hunter-dark transition-colors"
        >
          Resetează filtrele
        </a>
      </div>
    )
  }

  return (
    <AnimatedGrid>
      <div className="-mx-4 small:mx-0">
        <ul
          className="grid grid-cols-2 w-full small:grid-cols-2 medium:grid-cols-3 gap-[4px] small:gap-x-8 small:gap-y-16"
          data-testid="products-list"
        >
          {products.map((p, i) => {
            return (
              <AnimatedProductCard key={p.id} index={i}>
                <ProductPreview product={p} region={region} />
              </AnimatedProductCard>
            )
          })}
        </ul>
      </div>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </AnimatedGrid>
  )
}
