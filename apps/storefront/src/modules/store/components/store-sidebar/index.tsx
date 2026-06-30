"use client"

import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { clx } from "@modules/common/components/ui"
import { SortOptions } from "../refinement-list/sort-products"

type Props = {
  collections: HttpTypes.StoreCollection[]
  categories: HttpTypes.StoreProductCategory[]
  sortBy: SortOptions
  selectedCollection?: string
  selectedCategory?: string
  collectionCategories?: HttpTypes.StoreProductCategory[]
}

const sortOptions: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Cele mai noi" },
  { value: "price_asc", label: "Preț crescător" },
  { value: "price_desc", label: "Preț descrescător" },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-3">
      {children}
    </p>
  )
}

export default function StoreSidebar({
  collections,
  categories,
  sortBy,
  selectedCollection,
  selectedCategory,
  collectionCategories = [],
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams)
      // categories and collections are mutually exclusive
      if (key === "category") params.delete("collection")
      if (key === "collection") params.delete("category")
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete("category")
    params.delete("collection")
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }, [pathname, router, searchParams])

  const setCollectionAndCategory = useCallback(
    (collectionId: string, categoryId: string | null) => {
      const params = new URLSearchParams(searchParams)
      params.set("collection", collectionId)
      if (categoryId) {
        params.set("category", categoryId)
      } else {
        params.delete("category")
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const hasFilters = !!selectedCollection || !!selectedCategory

  // Only top-level categories at the first level
  const topCategories = categories.filter((c) => !c.parent_category)
  // Active category only when NOT in collection context
  const activeCategoryId = selectedCollection ? null : selectedCategory
  const selectedCat = activeCategoryId
    ? categories.find((c) => c.id === activeCategoryId)
    : null
  // The parent whose subcategories should be revealed
  const activeParentId = selectedCat
    ? selectedCat.parent_category?.id ?? selectedCat.id
    : null
  const subcategoriesOf = (parentId: string) =>
    categories.filter((c) => c.parent_category?.id === parentId)

  const NavItem = ({
    active,
    onClick,
    children,
  }: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
  }) => (
    <button
      onClick={onClick}
      className={clx(
        "w-full text-left py-2 font-serif text-[22px] leading-none transition-colors duration-150",
        active
          ? "text-[var(--theme-gold)] italic"
          : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
      )}
    >
      {children}
    </button>
  )

  return (
    <aside className="hidden small:block w-52 shrink-0">
      <div className="sticky top-28 flex flex-col">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="pb-8">
            <SectionLabel>Categorii</SectionLabel>
            <nav className="flex flex-col">
              {topCategories.map((c) => {
                const subs = subcategoriesOf(c.id)
                const isActiveParent = activeParentId === c.id
                return (
                  <div key={c.id}>
                    <NavItem
                      active={activeCategoryId === c.id}
                      onClick={() =>
                        updateParam(
                          "category",
                          activeCategoryId === c.id ? null : c.id
                        )
                      }
                    >
                      {c.name}
                    </NavItem>
                    {subs.length > 0 && isActiveParent && (
                      <div className="flex flex-col pl-4 mt-1 mb-1 border-l border-[var(--theme-border)]">
                        {subs.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() =>
                              updateParam(
                                "category",
                                activeCategoryId === sub.id ? c.id : sub.id
                              )
                            }
                            className={clx(
                              "w-full text-left py-1.5 font-serif text-[18px] leading-none transition-colors duration-150",
                              activeCategoryId === sub.id
                                ? "text-[var(--theme-gold)] italic"
                                : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                            )}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        )}

        {/* Collections */}
        {collections.length > 0 && (
          <div className="py-8 border-t border-[var(--theme-border)]">
            <SectionLabel>Colecții</SectionLabel>
            <nav className="flex flex-col">
              {collections.map((c) => {
                const isSelected = selectedCollection === c.id
                return (
                  <div key={c.id}>
                    <NavItem
                      active={isSelected && !selectedCategory}
                      onClick={() =>
                        updateParam(
                          "collection",
                          isSelected ? null : c.id
                        )
                      }
                    >
                      {c.title}
                    </NavItem>
                    {isSelected && collectionCategories.length > 0 && (
                      <div className="flex flex-col pl-4 mt-1 mb-1 border-l border-[var(--theme-border)]">
                        {collectionCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() =>
                              setCollectionAndCategory(
                                c.id,
                                selectedCategory === cat.id ? null : cat.id
                              )
                            }
                            className={clx(
                              "w-full text-left py-1.5 font-serif text-[18px] leading-none transition-colors duration-150",
                              selectedCategory === cat.id
                                ? "text-[var(--theme-gold)] italic"
                                : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                            )}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        )}

        {hasFilters && (
          <div className="pt-8">
            <button
              onClick={clearAll}
              className="font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-transparent hover:border-hunter-gold pb-0.5"
            >
              Resetează filtrele
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
