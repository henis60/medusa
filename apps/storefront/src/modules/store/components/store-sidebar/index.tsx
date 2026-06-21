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
}

const sortOptions: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Cele mai noi" },
  { value: "price_asc", label: "Preț crescător" },
  { value: "price_desc", label: "Preț descrescător" },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className="h-px w-5 bg-hunter-gold" />
      <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)]">
        {children}
      </p>
    </div>
  )
}

export default function StoreSidebar({
  collections,
  categories,
  sortBy,
  selectedCollection,
  selectedCategory,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams)
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

  const hasFilters = !!selectedCollection || !!selectedCategory

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
        "w-full text-left font-serif text-xl leading-snug py-1 transition-colors",
        active
          ? "text-hunter-gold italic"
          : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
      )}
    >
      {children}
    </button>
  )

  return (
    <aside className="hidden small:block w-60 shrink-0">
      <div className="sticky top-28 flex flex-col divide-y divide-[var(--theme-border)]">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="pb-8">
            <SectionLabel>Categorii</SectionLabel>
            <nav className="flex flex-col gap-0.5">
              <NavItem
                active={!selectedCategory}
                onClick={() => updateParam("category", null)}
              >
                Toate
              </NavItem>
              {categories.map((c) => (
                <NavItem
                  key={c.id}
                  active={selectedCategory === c.id}
                  onClick={() =>
                    updateParam(
                      "category",
                      selectedCategory === c.id ? null : c.id
                    )
                  }
                >
                  {c.name}
                </NavItem>
              ))}
            </nav>
          </div>
        )}

        {/* Collections */}
        {collections.length > 0 && (
          <div className="py-8">
            <SectionLabel>Colecții</SectionLabel>
            <nav className="flex flex-col gap-0.5">
              {collections.map((c) => (
                <NavItem
                  key={c.id}
                  active={selectedCollection === c.id}
                  onClick={() =>
                    updateParam(
                      "collection",
                      selectedCollection === c.id ? null : c.id
                    )
                  }
                >
                  {c.title}
                </NavItem>
              ))}
            </nav>
          </div>
        )}

        {/* Sort */}
        <div className="py-8">
          <SectionLabel>Sortare</SectionLabel>
          <nav className="flex flex-col gap-0.5">
            {sortOptions.map((opt) => (
              <NavItem
                key={opt.value}
                active={sortBy === opt.value}
                onClick={() => updateParam("sortBy", opt.value)}
              >
                {opt.label}
              </NavItem>
            ))}
          </nav>
        </div>

        {hasFilters && (
          <div className="pt-8">
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams)
                params.delete("collection")
                params.delete("category")
                params.delete("page")
                router.push(`${pathname}?${params.toString()}`)
              }}
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
