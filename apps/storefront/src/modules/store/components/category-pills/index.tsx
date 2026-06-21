"use client"

import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { clx } from "@modules/common/components/ui"

type Props = {
  categories: HttpTypes.StoreProductCategory[]
  selectedCategory?: string
}

export default function CategoryPills({ categories, selectedCategory }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const select = useCallback(
    (value: string | null) => {
      const params = new URLSearchParams(searchParams)
      if (value) params.set("category", value)
      else params.delete("category")
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  if (!categories.length) return null

  const pill = (active: boolean) =>
    clx(
      "shrink-0 font-serif text-base leading-none pb-1.5 border-b transition-colors whitespace-nowrap",
      active
        ? "text-hunter-gold italic border-hunter-gold"
        : "text-[var(--theme-text-muted)] border-transparent"
    )

  return (
    <div className="small:hidden border-b border-[var(--theme-border)]">
      <div className="content-container">
        <div className="flex items-center gap-6 overflow-x-auto py-3 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button onClick={() => select(null)} className={pill(!selectedCategory)}>
            Toate
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => select(selectedCategory === c.id ? null : c.id)}
              className={pill(selectedCategory === c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
