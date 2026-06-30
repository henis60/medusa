"use client"

import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { clx } from "@modules/common/components/ui"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreSortSelect from "@modules/store/components/store-sort-select"

type Props = {
  categories: HttpTypes.StoreProductCategory[]
  collections: HttpTypes.StoreCollection[]
  selectedCategory?: string
  selectedCollection?: string
  sortBy?: SortOptions
  collectionCategories?: HttpTypes.StoreProductCategory[]
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
      setFadeRight(Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth)
    }
    const resizeObs = new ResizeObserver(update)
    const mutationObs = new MutationObserver(() =>
      requestAnimationFrame(update)
    )
    resizeObs.observe(el)
    mutationObs.observe(el, { childList: true, subtree: true })
    el.addEventListener("scroll", update, { passive: true })
    const id = requestAnimationFrame(update)
    return () => {
      cancelAnimationFrame(id)
      resizeObs.disconnect()
      mutationObs.disconnect()
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
  collectionCategories = [],
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const catsRef = useRef<HTMLDivElement>(null)
  const [catsFade, setCatsFade] = useState(false)
  const [catsFadeLeft, setCatsFadeLeft] = useState(false)

  // Scroll active pill into view when selection changes
  useEffect(() => {
    const container = catsRef.current
    if (!container) return
    requestAnimationFrame(() => {
      const active = container.querySelector<HTMLElement>(
        "[data-active='true']"
      )
      if (!active) return
      const cr = container.getBoundingClientRect()
      const ar = active.getBoundingClientRect()
      if (ar.left < cr.left || ar.right > cr.right) {
        active.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        })
      }
    })
  }, [selectedCategory, selectedCollection])

  useEffect(() => {
    const el = catsRef.current
    if (!el) return
    const update = () => {
      setCatsFade(Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth)
      setCatsFadeLeft(el.scrollLeft > 1)
    }
    const resizeObs = new ResizeObserver(update)
    const mutationObs = new MutationObserver(() =>
      requestAnimationFrame(update)
    )
    resizeObs.observe(el)
    mutationObs.observe(el, { childList: true, subtree: true })
    el.addEventListener("scroll", update, { passive: true })
    const id = requestAnimationFrame(update)
    return () => {
      cancelAnimationFrame(id)
      resizeObs.disconnect()
      mutationObs.disconnect()
      el.removeEventListener("scroll", update)
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

  const setCollectionAndCategory = useCallback(
    (collectionId: string, categoryId: string | null) => {
      const params = new URLSearchParams(searchParams)
      params.set("collection", collectionId)
      if (categoryId) params.set("category", categoryId)
      else params.delete("category")
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
  // Active category only when NOT in collection context
  const activeCategoryId = selectedCollection ? null : selectedCategory
  const selectedCat = activeCategoryId
    ? categories.find((c) => c.id === activeCategoryId)
    : null
  // The parent whose subcategories should be revealed as sub-chips
  const activeParentId = selectedCat
    ? selectedCat.parent_category?.id ?? selectedCat.id
    : null
  const subChips = activeParentId
    ? categories.filter((c) => c.parent_category?.id === activeParentId)
    : []

  const divider = (
    <span className="shrink-0 w-px h-5 bg-[var(--theme-border)]" />
  )

  return (
    <div className="small:hidden sticky top-16 z-50 bg-white">
      {/* Categories + Collections row */}
      {(collections.length > 0 || categories.length > 0) && (
        <div>
          <div className="page-container">
            <div className="relative">
              <div
                ref={catsRef}
                className="flex items-center gap-3 overflow-x-auto pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {topCategories.map((c, i) => {
                  const isActive =
                    activeCategoryId === c.id || activeParentId === c.id
                  return (
                    <motion.button
                      key={c.id}
                      custom={i}
                      variants={chipVariants}
                      initial="hidden"
                      animate="show"
                      data-active={isActive ? "true" : undefined}
                      onClick={() =>
                        update(
                          "category",
                          activeCategoryId === c.id ? null : c.id
                        )
                      }
                      className={chip(isActive)}
                    >
                      {c.name}
                    </motion.button>
                  )
                })}
                {collections.length > 0 && divider}
                {collections.map((c, i) => {
                  const isActive = selectedCollection === c.id
                  return (
                    <motion.button
                      key={c.id}
                      custom={categories.length + 1 + i}
                      variants={chipVariants}
                      initial="hidden"
                      animate="show"
                      data-active={isActive ? "true" : undefined}
                      onClick={() =>
                        update(
                          "collection",
                          selectedCollection === c.id ? null : c.id
                        )
                      }
                      className={chip(isActive)}
                    >
                      {c.title}
                    </motion.button>
                  )
                })}
              </div>
              {catsFadeLeft && (
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent" />
              )}
              {catsFade && (
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent" />
              )}
            </div>
          </div>

          {/* Subcategory chips (for categories) */}
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
                  <FadeScroller className="flex items-center gap-2 overflow-x-auto pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {subChips.map((sub, i) => {
                      const active = activeCategoryId === sub.id
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

          {/* Collection category chips */}
          <AnimatePresence initial={false}>
            {selectedCollection && collectionCategories.length > 0 && (
              <motion.div
                key={selectedCollection + "-cats"}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="page-container">
                  <FadeScroller className="flex items-center gap-2 overflow-x-auto pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {collectionCategories.map((cat, i) => {
                      const active = selectedCategory === cat.id
                      return (
                        <motion.button
                          key={cat.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.25,
                            delay: 0.05 + i * 0.04,
                            ease: "easeOut",
                          }}
                          onClick={() =>
                            setCollectionAndCategory(
                              selectedCollection,
                              active ? null : cat.id
                            )
                          }
                          className={clx(
                            "shrink-0 font-sans text-[10px] uppercase tracking-[2px] px-3 py-1.5 border transition-colors whitespace-nowrap",
                            active
                              ? "border-hunter-gold/60 text-hunter-gold"
                              : "border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:border-[var(--theme-text-muted)]"
                          )}
                        >
                          {cat.name}
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

      {/* Sort row */}
      <div className="page-container py-3 flex justify-end">
        <StoreSortSelect sortBy={sortBy} />
      </div>
    </div>
  )
}
