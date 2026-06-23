import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]
  const getParents = (cat: HttpTypes.StoreProductCategory) => {
    if (cat.parent_category) {
      parents.push(cat.parent_category)
      getParents(cat.parent_category)
    }
  }
  getParents(category)

  return (
    <div className="bg-[var(--theme-bg)] w-full min-h-screen">
      {/* Editorial header */}
      <div className="page-container pt-6 pb-5">
        {parents.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {[...parents].reverse().map((parent, i) => (
              <span key={parent.id} className="flex items-center gap-2">
                <LocalizedClientLink
                  href={`/categories/${parent.handle}`}
                  className="font-sans text-[9px] uppercase tracking-[6px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
                >
                  {parent.name}
                </LocalizedClientLink>
                <span className="text-[var(--theme-text-muted)] text-[9px]">/</span>
              </span>
            ))}
          </div>
        )}
        <p className="font-sans text-[9px] uppercase tracking-[8px] text-hunter-green dark:text-hunter-green-m mb-5">
          Hunter House
        </p>
        <h1
          data-testid="category-page-title"
          className="font-display text-4xl small:text-6xl text-[var(--theme-text)] leading-[1.0]"
        >
          {category.name.split(" ").slice(0, -1).join(" ")}{" "}
          <span className="italic text-hunter-gold">
            {category.name.split(" ").slice(-1)[0]}
          </span>
        </h1>
        {category.description && (
          <p className="mt-5 font-serif text-base text-[var(--theme-text-muted)] max-w-lg leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {/* Sort bar */}
      <div className="border-y border-[var(--theme-border)]">
        <div className="page-container py-3 flex items-center justify-end">
          <RefinementList sortBy={sort} />
        </div>
      </div>

      {/* Subcategories */}
      {category.category_children && category.category_children.length > 0 && (
        <div className="page-container pt-8">
          <div className="flex flex-wrap gap-3">
            {category.category_children.map((c) => (
              <LocalizedClientLink
                key={c.id}
                href={`/categories/${c.handle}`}
                className="font-sans text-[10px] uppercase tracking-[3px] px-4 py-2 border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-hunter-gold hover:text-[var(--theme-text)] transition-colors"
              >
                {c.name}
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      )}

      {/* Product grid */}
      <div className="page-container py-10" data-testid="category-container">
        <Suspense
          fallback={
            <SkeletonProductGrid numberOfProducts={category.products?.length ?? 8} />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
