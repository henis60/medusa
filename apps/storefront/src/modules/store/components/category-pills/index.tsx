"use client"

import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { clx } from "@modules/common/components/ui"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const SORT_OPTIONS: {
  value: SortOptions
  label: string
  chevron?: "up" | "down"
}[] = [
  { value: "created_at", label: "Cele mai noi" },
  { value: "price_asc", label: "Preț", chevron: "up" },
  { value: "price_desc", label: "Preț", chevron: "down" },
]

function Chevron({ dir }: { dir: "up" | "down" }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="inline-block"
    >
      <polyline points={dir === "up" ? "6 15 12 9 18 15" : "6 9 12 15 18 9"} />
    </svg>
  )
}

type Props = {
  categories: HttpTypes.StoreProductCategory[]
  collections: HttpTypes.StoreCollection[]
  selectedCategory?: string
  selectedCollection?: string
  sortBy?: SortOptions
}

// Horizontally scrollable row with edge fades that appear/disappear with scroll
function FadeScroller({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [fadeLeft, setFadeLeft] = useState(false)
  const [fadeRight, setFadeRight] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      setFadeLeft(el.scrollLeft > 1)
      setFadeRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    const observer = new ResizeObserver(update)
    observer.observe(el)
    el.addEventListener("scroll", update, { passive: true })
    update()
    return () => {
      observer.disconnect()
      el.removeEventListener("scroll", update)
    }
  }, [])

  return (
    <div className="relative">
      <div ref={ref} className={className}>
        {children}
      </div>
      {fadeLeft && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent" />
      )}
      {fadeRight && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent" />
      )}
    </div>
  )
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
  const [catsFade, setCatsFade] = useState(false)
  const [catsFadeLeft, setCatsFadeLeft] = useState(false)

  useEffect(() => {
    const check = (el: HTMLDivElement | null, set: (v: boolean) => void) => {
      if (el) {
        // Show fade only when there's still content to scroll to on the right
        const hasMore = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
        set(hasMore)
      }
    }
    const update = () => {
      check(catsRef.current, setCatsFade)
      // Left fade appears once content is scrolled away on the left
      setCatsFadeLeft(!!catsRef.current && catsRef.current.scrollLeft > 1)
    }
    const observer = new ResizeObserver(update)
    if (catsRef.current) observer.observe(catsRef.current)
    const catsEl = catsRef.current
    catsEl?.addEventListener("scroll", update, { passive: true })
    update()
    return () => {
      observer.disconnect()
      catsEl?.removeEventListener("scroll", update)
    }
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
      "shrink-0 font-sans uppercase text-[12px] tracking-[2px] leading-none px-4 py-2 border transition-colors whitespace-nowrap",
      active
        ? "border-hunter-gold/60 text-hunter-gold"
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

  // Only top-level categories at the first level
  const topCategories = categories.filter((c) => !c.parent_category)
  // Selected category may itself be a subcategory
  const selectedCat = categories.find((c) => c.id === selectedCategory)
  // The parent whose subcategories should be revealed as sub-chips
  const activeParentId = selectedCat
    ? selectedCat.parent_category?.id ?? selectedCat.id
    : null
  const subChips = activeParentId
    ? categories.filter((c) => c.parent_category?.id === activeParentId)
    : []

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
    <div className="small:hidden sticky top-16 z-50 bg-white">
      {/* Sort row */}
      <div>
        <div className="page-container">
          <div>
            <div
              ref={sortRef}
              className="flex items-center justify-start gap-4 py-3"
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
                    "shrink-0 inline-flex items-center gap-1 font-sans text-[9px] tracking-[1px] min-[360px]:text-[10px] min-[360px]:tracking-[2px] uppercase transition-colors whitespace-nowrap",
                    sortBy === opt.value
                      ? "text-hunter-gold"
                      : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                  )}
                >
                  {opt.label}
                  {opt.chevron && <Chevron dir={opt.chevron} />}
                </motion.button>
              ))}
            </div>
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
                className="flex items-center gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {topCategories.map((c, i) => (
                  <motion.button
                    key={c.id}
                    custom={i}
                    variants={chipVariants}
                    initial="hidden"
                    animate="show"
                    onClick={() =>
                      update(
                        "category",
                        selectedCategory === c.id ? null : c.id
                      )
                    }
                    className={chip(
                      selectedCategory === c.id || activeParentId === c.id
                    )}
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
              {catsFadeLeft && (
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent" />
              )}
              {catsFade && (
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent" />
              )}
            </div>
          </div>

          {/* Subcategory chips */}
          <AnimatePresence initial={false}>
            {subChips.length > 0 && (
              <motion.div
                key={activeParentId ?? "subchips"}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="page-container">
                  <FadeScroller className="flex items-center gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {subChips.map((sub, i) => {
                      const active = selectedCategory === sub.id
                      return (
                        <motion.button
                          key={sub.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.25,
                            delay: 0.05 + i * 0.04,
                            ease: "easeOut",
                          }}
                          onClick={() =>
                            update(
                              "category",
                              active ? (activeParentId as string) : sub.id
                            )
                          }
                          className={clx(
                            "shrink-0 font-sans text-[10px] uppercase tracking-[2px] px-3 py-1.5 border transition-colors whitespace-nowrap",
                            active
                              ? "border-hunter-gold/60 text-hunter-gold"
                              : "border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:border-[var(--theme-text-muted)]"
                          )}
                        >
                          {sub.name}
                        </motion.button>
                      )
                    })}
                  </FadeScroller>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
