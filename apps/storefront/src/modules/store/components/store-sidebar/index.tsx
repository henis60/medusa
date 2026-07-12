"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import { SortOptions } from "../refinement-list/sort-products"

type Props = {
  collections: HttpTypes.StoreCollection[]
  categories: HttpTypes.StoreProductCategory[]
  sortBy: SortOptions
  selectedCollection?: string
  selectedCategory?: string
  collectionCategories?: HttpTypes.StoreProductCategory[]
  onSelectCategory: (id: string | null) => void
  onSelectCollection: (id: string | null) => void
  onSelectCollectionCategory: (collectionId: string, categoryId: string | null) => void
  onClearFilters: () => void
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="h-px w-5 bg-hunter-gold/60" />
      <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)]">
        {children}
      </p>
    </div>
  )
}

/**
 * Desktop category/collection nav. Selection is driven entirely by the
 * onSelect* callbacks (owned by StoreView), which update an optimistic
 * local mirror of category/collection before syncing the URL — so
 * highlighting and the subcategory reveal below update instantly, without
 * waiting on however long the navigation itself takes to commit.
 */
export default function StoreSidebar({
  collections,
  categories,
  selectedCollection,
  selectedCategory,
  collectionCategories = [],
  onSelectCategory,
  onSelectCollection,
  onSelectCollectionCategory,
  onClearFilters,
}: Props) {
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
        "w-full text-left py-2 font-serif text-[20px] leading-none transition-all duration-150",
        active
          ? "text-[var(--theme-gold)] italic pl-1"
          : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:pl-1"
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
                const showSubs = subs.length > 0 && isActiveParent
                return (
                  <div key={c.id}>
                    <NavItem
                      active={activeCategoryId === c.id}
                      onClick={() =>
                        onSelectCategory(activeCategoryId === c.id ? null : c.id)
                      }
                    >
                      {c.name}
                    </NavItem>
                    {/* Only the active parent's subcategories are mounted —
                        keeping every category's row always-mounted (even at
                        height 0) meant switching between two categories that
                        both have subs animated one collapsing while the other
                        expanded at the same time, showing the old ones
                        briefly. Mount/unmount + a plain fade-in avoids that
                        overlap entirely. */}
                    {showSubs && (
                      <div className="min-h-0 overflow-hidden animate-[fadeIn_0.22s_ease-out]">
                        <div className="flex flex-col pl-4 mt-1 mb-1 border-l border-[var(--theme-border)]">
                          {subs.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() =>
                                onSelectCategory(
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
          <div className="pb-8">
            <SectionLabel>Colecții</SectionLabel>
            <nav className="flex flex-col">
              {collections.map((c) => {
                const isSelected = selectedCollection === c.id
                return (
                  <div key={c.id}>
                    <NavItem
                      active={isSelected && !selectedCategory}
                      onClick={() => onSelectCollection(isSelected ? null : c.id)}
                    >
                      {c.title}
                    </NavItem>
                    {/* collectionCategories is a synchronous lookup
                        (precomputed server-side for every collection), so
                        this needs no loading state at all — same
                        mount-on-select + fade-in as plain categories. */}
                    {isSelected && collectionCategories.length > 0 && (
                      <div className="flex flex-col pl-4 mt-1 mb-1 border-l border-[var(--theme-border)] animate-[fadeIn_0.22s_ease-out]">
                        {collectionCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() =>
                              onSelectCollectionCategory(
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
              onClick={onClearFilters}
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
