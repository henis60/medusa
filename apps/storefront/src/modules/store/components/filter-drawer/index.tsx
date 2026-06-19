"use client"

import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { clx } from "@modules/common/components/ui"
import { SortOptions } from "../refinement-list/sort-products"

type Props = {
  collections: HttpTypes.StoreCollection[]
  categories: HttpTypes.StoreProductCategory[]
  sortBy: SortOptions
  selectedCollection?: string
  selectedCategory?: string
}

export default function FilterDrawer({
  collections,
  categories,
  sortBy,
  selectedCollection,
  selectedCategory,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const [localCollection, setLocalCollection] = useState(selectedCollection ?? "")
  const [localCategory, setLocalCategory] = useState(selectedCategory ?? "")
  const [localSort, setLocalSort] = useState<SortOptions>(sortBy ?? "created_at")

  // Swipe-to-close state
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragY = useRef(0)
  const startY = useRef(0)
  const dragging = useRef(false)
  const [dragOffset, setDragOffset] = useState(0)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (open) {
      setLocalCollection(selectedCollection ?? "")
      setLocalCategory(selectedCategory ?? "")
      setLocalSort(sortBy ?? "created_at")
      setDragOffset(0)
    }
  }, [open, selectedCollection, selectedCategory, sortBy])

  // Scroll lock
  useEffect(() => {
    if (!open) return
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`
    const allowSelector = '[data-scroll-lock-allow="true"]'
    const isAllowed = (t: EventTarget | null) =>
      t instanceof HTMLElement && !!t.closest(allowSelector)
    const onWheel = (e: WheelEvent) => { if (!isAllowed(e.target)) e.preventDefault() }
    const onTouch = (e: TouchEvent) => { if (!isAllowed(e.target)) e.preventDefault() }
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"," "].includes(e.key) && !isAllowed(document.activeElement))
        e.preventDefault()
    }
    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchmove", onTouch, { passive: false })
    window.addEventListener("keydown", onKey)
    return () => {
      document.documentElement.style.overflow = ''
      document.documentElement.style.paddingRight = ''
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchmove", onTouch)
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  // Swipe handlers — only on the handle/header area
  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true
    startY.current = e.touches[0].clientY
    dragY.current = 0
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return
    const delta = e.touches[0].clientY - startY.current
    if (delta < 0) return // don't allow dragging up
    dragY.current = delta
    setDragOffset(delta)
  }

  const onTouchEnd = () => {
    dragging.current = false
    if (dragY.current > 80) {
      setDragOffset(0)
      setOpen(false)
    } else {
      setDragOffset(0)
    }
  }

  const activeCount = [!!selectedCollection, !!selectedCategory].filter(Boolean).length

  const apply = () => {
    const params = new URLSearchParams(searchParams)
    if (localCollection) params.set("collection", localCollection)
    else params.delete("collection")
    if (localCategory) params.set("category", localCategory)
    else params.delete("category")
    if (!isDesktop) params.set("sortBy", localSort)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  const clear = () => {
    setLocalCollection("")
    setLocalCategory("")
    setLocalSort("created_at")
    const params = new URLSearchParams(searchParams)
    params.delete("collection")
    params.delete("category")
    params.delete("sortBy")
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className={clx(
          "inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[3px] transition-colors",
          activeCount > 0
            ? "text-hunter-gold hover:text-hunter-gold/80"
            : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
        )}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="16" y2="12" />
          <line x1="4" y1="18" x2="12" y2="18" />
        </svg>
        <span>Filtre</span>
      </button>

      {mounted && createPortal(
        <>
          {/* Backdrop */}
          <div
            className={clx(
              "fixed inset-0 z-[9020] bg-black/50 transition-opacity duration-300",
              open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
            onClick={() => setOpen(false)}
          />

          {/* Mobile: bottom sheet / Desktop: right panel */}
          <div
            ref={sheetRef}
            className={clx(
              "fixed z-[9021] bg-[var(--theme-bg)] flex flex-col",
              "inset-x-0 bottom-0 border-t border-[var(--theme-border)]",
              "small:inset-x-auto small:inset-y-0 small:right-0 small:w-[420px] small:border-t-0 small:border-l small:border-[var(--theme-border)]",
              dragOffset === 0 ? "transition-transform duration-300 ease-out" : "",
              "filter-drawer-panel",
              open && "is-open"
            )}
            style={{
              transform: isDesktop
                ? open ? "translateX(0)" : "translateX(100%)"
                : open ? `translateY(${dragOffset}px)` : "translateY(100%)",
            }}
          >
            {/* Drag handle — mobile only */}
            <div
              className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none small:hidden"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="w-10 h-1 rounded-full bg-[var(--theme-border)]" />
            </div>

            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b border-[var(--theme-border)] touch-none"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <span className="font-sans text-[10px] uppercase tracking-[4px] text-[var(--theme-text-muted)]">
                Filtre
              </span>
              <button
                onClick={() => setOpen(false)}
                className="hidden small:flex text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
                aria-label="Închide"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-5 flex flex-col gap-6 overflow-y-auto overscroll-contain" data-scroll-lock-allow="true">

              {/* Sort — mobile only */}
              {(() => {
                const sortOptions: { value: SortOptions; label: string }[] = [
                  { value: "created_at", label: "Latest" },
                  { value: "price_asc", label: "Price ↑" },
                  { value: "price_desc", label: "Price ↓" },
                ]
                return (
                  <div className="small:hidden">
                    <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-3">Sortare</p>
                    <div className="flex flex-wrap gap-2">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setLocalSort(opt.value)}
                          className={clx(
                            "px-4 py-2 font-sans text-[10px] uppercase tracking-[2px] border transition-colors",
                            localSort === opt.value
                              ? "border-hunter-gold text-[var(--theme-text)] bg-hunter-gold/10"
                              : "border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-[var(--theme-text-muted)]"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Collections */}
              {collections.length > 0 && (
                <div>
                  <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-3">Colecții</p>
                  <div className="flex flex-wrap gap-2">
                    {collections.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setLocalCollection(localCollection === c.id ? "" : c.id)}
                        className={clx(
                          "px-4 py-2 font-sans text-[10px] uppercase tracking-[2px] border transition-colors",
                          localCollection === c.id
                            ? "border-hunter-gold text-[var(--theme-text)] bg-hunter-gold/10"
                            : "border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-[var(--theme-text-muted)]"
                        )}
                      >
                        {c.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-3">Categorii</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setLocalCategory(localCategory === c.id ? "" : c.id)}
                        className={clx(
                          "px-4 py-2 font-sans text-[10px] uppercase tracking-[2px] border transition-colors",
                          localCategory === c.id
                            ? "border-hunter-gold text-[var(--theme-text)] bg-hunter-gold/10"
                            : "border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-[var(--theme-text-muted)]"
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--theme-border)] flex gap-3">
              <button
                onClick={clear}
                className="flex-1 py-3 font-sans text-[10px] uppercase tracking-[3px] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-[var(--theme-text-muted)] transition-colors"
              >
                Resetează
              </button>
              <button
                onClick={apply}
                className="flex-[2] py-3 font-sans text-[10px] uppercase tracking-[3px] bg-hunter-gold text-hunter-dark transition-opacity hover:opacity-90"
              >
                Aplică
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
