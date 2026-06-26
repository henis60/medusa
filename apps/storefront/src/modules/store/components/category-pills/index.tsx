"use client"

import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { clx } from "@modules/common/components/ui"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const SORT_OPTIONS: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Cele mai noi" },
  { value: "price_asc", label: "Preț crescător" },
  { value: "price_desc", label: "Preț descrescător" },
]

type Props = {
  categories: HttpTypes.StoreProductCategory[]
  collections: HttpTypes.StoreCollection[]
  selectedCategory?: string
  selectedCollection?: string
  sortBy?: SortOptions
}

export default function CategoryPills({
  categories,
  collections,
  selectedCategory,
  selectedCollection,
  sortBy = "created_at",
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const sortRef = useRef<HTMLDivElement>(null)
  const catsRef = useRef<HTMLDivElement>(null)
  const [sortFade, setSortFade] = useState(false)
  const [catsFade, setCatsFade] = useState(false)

  useEffect(() => {
    const check = (el: HTMLDivElement | null, set: (v: boolean) => void) => {
      if (el) set(el.scrollWidth > el.clientWidth)
    }
    const observer = new ResizeObserver(() => {
      check(sortRef.current, setSortFade)
      check(catsRef.current, setCatsFade)
    })
    if (sortRef.current) observer.observe(sortRef.current)
    if (catsRef.current) observer.observe(catsRef.current)
    check(sortRef.current, setSortFade)
    check(catsRef.current, setCatsFade)
    return () => observer.disconnect()
  }, [])

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams)
      if (key === "category") params.delete("collection")
      if (key === "collection") params.delete("category")
      if (value) params.set(key, value)
      else params.delete(key)
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const chip = (active: boolean) =>
    clx(
      "shrink-0 font-serif text-[15px] leading-none px-4 py-2 border transition-colors whitespace-nowrap",
      active
        ? "border-hunter-gold/60 text-hunter-gold italic"
        : "border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:border-[var(--theme-text-muted)]"
    )

  const chipVariants = {
    hidden: { opacity: 0, y: 10 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: i * 0.05,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
  }

  const sortVariants = {
    hidden: { opacity: 0, y: 6 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, delay: i * 0.06, ease: "easeOut" as const },
    }),
  }

  const divider = (
    <span className="shrink-0 w-px h-5 bg-[var(--theme-border)]" />
  )

  return (
    <div className="small:hidden sticky top-16 z-50 bg-[var(--theme-bg)]">
      {/* Sort row */}
      <div>
        <div className="page-container">
          <div className="relative">
            <div
              ref={sortRef}
              className="flex items-center gap-4 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {SORT_OPTIONS.map((opt, i) => (
                <motion.button
                  key={opt.value}
                  custom={i}
                  variants={sortVariants}
                  initial="hidden"
                  animate="show"
                  onClick={() =>
                    update(
                      "sortBy",
                      opt.value === "created_at" ? null : opt.value
                    )
                  }
                  className={clx(
                    "shrink-0 font-sans text-[10px] uppercase tracking-[2px] transition-colors whitespace-nowrap",
                    sortBy === opt.value
                      ? "text-hunter-gold"
                      : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                  )}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
            {sortFade && (
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[var(--theme-bg)] to-transparent" />
            )}
          </div>
        </div>
      </div>

      {/* Categories + Collections row */}
      {(collections.length > 0 || categories.length > 0) && (
        <div>
          <div className="page-container">
            <div className="relative">
              <div
                ref={catsRef}
                className="flex items-center gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <motion.button
                  custom={0}
                  variants={chipVariants}
                  initial="hidden"
                  animate="show"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams)
                    params.delete("category")
                    params.delete("collection")
                    params.delete("page")
                    router.push(`${pathname}?${params.toString()}`)
                  }}
                  className={chip(!selectedCategory && !selectedCollection)}
                >
                  Toate
                </motion.button>
                {categories.map((c, i) => (
                  <motion.button
                    key={c.id}
                    custom={i + 1}
                    variants={chipVariants}
                    initial="hidden"
                    animate="show"
                    onClick={() =>
                      update(
                        "category",
                        selectedCategory === c.id ? null : c.id
                      )
                    }
                    className={chip(selectedCategory === c.id)}
                  >
                    {c.name}
                  </motion.button>
                ))}
                {collections.length > 0 && divider}
                {collections.map((c, i) => (
                  <motion.button
                    key={c.id}
                    custom={categories.length + 1 + i}
                    variants={chipVariants}
                    initial="hidden"
                    animate="show"
                    onClick={() =>
                      update(
                        "collection",
                        selectedCollection === c.id ? null : c.id
                      )
                    }
                    className={chip(selectedCollection === c.id)}
                  >
                    {c.title}
                  </motion.button>
                ))}
              </div>
              {catsFade && (
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[var(--theme-bg)] to-transparent" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
