"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { clx } from "@modules/common/components/ui"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PriceRangeSlider from "@modules/store/components/price-range-slider"
import { useScrollLock } from "@lib/hooks/use-scroll-lock"

export type ViewMode = "grid" | "list"

export const sortOptions: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Cele mai noi" },
  { value: "price_asc", label: "Preț crescător" },
  { value: "price_desc", label: "Preț descrescător" },
]

function ViewToggleIcon({ view }: { view: ViewMode }) {
  // Shows the icon for the view you'd switch TO.
  return view === "grid" ? (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="4" width="18" height="6" />
      <rect x="3" y="14" width="18" height="6" />
    </svg>
  ) : (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  )
}

export default function StoreResultsBar({
  count,
  loading,
  view,
  onViewChange,
  colorFacets = [],
  priceBounds,
}: {
  count: number
  loading?: boolean
  view: ViewMode
  onViewChange: (v: ViewMode) => void
  colorFacets?: string[]
  priceBounds: [number, number]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  useScrollLock(open)
  const [dragOffset, setDragOffset] = useState(0)
  const dragging = useRef(false)
  const startY = useRef(0)

  const onHandlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    startY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onHandlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const delta = e.clientY - startY.current
    if (delta < 0) return
    setDragOffset(delta)
  }
  const onHandlePointerUp = () => {
    if (!dragging.current) return
    dragging.current = false
    if (dragOffset > 80) setOpen(false)
    setDragOffset(0)
  }

  // Applied filters — what the grid actually reflects right now.
  const appliedSortBy =
    (searchParams.get("sortBy") as SortOptions) || "created_at"
  const appliedMinPrice = Number(searchParams.get("minPrice")) || priceBounds[0]
  const appliedMaxPrice = Number(searchParams.get("maxPrice")) || priceBounds[1]
  const appliedColors = (searchParams.get("color") ?? "")
    .split(",")
    .filter(Boolean)
  const priceActive =
    !!searchParams.get("minPrice") || !!searchParams.get("maxPrice")
  const filterCount = (priceActive ? 1 : 0) + (appliedColors.length > 0 ? 1 : 0)

  // Draft — edited inside the sheet, only applied to the URL (and the grid)
  // when "Arată produsele" is pressed.
  const [draftSort, setDraftSort] = useState(appliedSortBy)
  const [draftMinPrice, setDraftMinPrice] = useState(appliedMinPrice)
  const [draftMaxPrice, setDraftMaxPrice] = useState(appliedMaxPrice)
  const [draftColors, setDraftColors] = useState(appliedColors)

  // Re-sync the draft from the URL every time the sheet opens.
  useEffect(() => {
    if (!open) return
    setDraftSort(appliedSortBy)
    setDraftMinPrice(appliedMinPrice)
    setDraftMaxPrice(appliedMaxPrice)
    setDraftColors(appliedColors)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const pushParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams)
      mutate(params)
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const toggleDraftColor = (label: string) =>
    setDraftColors((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    )

  const draftFilterCount =
    (draftMinPrice > priceBounds[0] || draftMaxPrice < priceBounds[1] ? 1 : 0) +
    (draftColors.length > 0 ? 1 : 0)

  const applyDraft = () => {
    pushParams((params) => {
      params.set("sortBy", draftSort)
      if (draftMinPrice > priceBounds[0])
        params.set("minPrice", String(draftMinPrice))
      else params.delete("minPrice")
      if (draftMaxPrice < priceBounds[1])
        params.set("maxPrice", String(draftMaxPrice))
      else params.delete("maxPrice")
      if (draftColors.length) params.set("color", draftColors.join(","))
      else params.delete("color")
    })
    setOpen(false)
  }

  const clearFacets = () => {
    setDraftMinPrice(priceBounds[0])
    setDraftMaxPrice(priceBounds[1])
    setDraftColors([])
    pushParams((params) => {
      params.delete("minPrice")
      params.delete("maxPrice")
      params.delete("color")
    })
    setOpen(false)
  }

  const row = (active: boolean, onClick: () => void, label: string) => (
    <button
      key={label}
      onClick={onClick}
      className={clx(
        "w-full text-left py-3 font-serif text-[17px] leading-none transition-colors",
        active ? "text-hunter-gold italic" : "text-[var(--theme-text-muted)]"
      )}
    >
      {label}
    </button>
  )

  return (
    <div className="small:hidden flex items-center justify-between py-4">
      {loading ? (
        <span className="h-2.5 w-16 bg-[var(--theme-surface)] animate-pulse" />
      ) : (
        <span className="font-sans text-[10px] uppercase tracking-[2px] text-[var(--theme-text-muted)]">
          {count} {count === 1 ? "produs" : "produse"}
        </span>
      )}

      <div className="flex items-center gap-4">
        <button
          aria-label={
            view === "grid" ? "Vizualizare listă" : "Vizualizare grid"
          }
          onClick={() => onViewChange(view === "grid" ? "list" : "grid")}
          className="text-[var(--theme-text)]"
        >
          <ViewToggleIcon view={view} />
        </button>

        <button
          onClick={() => setOpen(true)}
          aria-label="Filtre"
          className={`relative text-[var(--theme-text)] ${
            filterCount > 0 ? "text-hunter-gold" : ""
          }`}
        >
          <FilterIcon />
        </button>
      </div>

      <>
        <div
          className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          style={{ pointerEvents: open ? "auto" : "none" }}
          onClick={() => setOpen(false)}
        />
        <div
          className="fixed left-0 right-0 bottom-0 z-[91] max-h-[80vh] bg-[var(--theme-bg)] rounded-t-2xl flex flex-col"
          style={{
            transform: `translateY(${open ? dragOffset : 1000}px)`,
            transition: dragging.current
              ? "none"
              : "transform 0.32s cubic-bezier(0.22,1,0.36,1)",
            pointerEvents: open ? "auto" : "none",
          }}
          aria-hidden={!open}
        >
          <div
            onPointerDown={onHandlePointerDown}
            onPointerMove={onHandlePointerMove}
            onPointerUp={onHandlePointerUp}
            onPointerCancel={onHandlePointerUp}
            className="flex justify-center pt-3 pb-2 shrink-0 cursor-grab active:cursor-grabbing touch-none"
          >
            <span className="w-9 h-1 rounded-full bg-[var(--theme-border)]" />
          </div>

          <div className="overflow-y-auto px-5 py-2 pb-8">
            {priceBounds[1] > priceBounds[0] && (
              <div className="py-3">
                <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-3">
                  Preț
                </p>
                <PriceRangeSlider
                  bounds={priceBounds}
                  value={[draftMinPrice, draftMaxPrice]}
                  onCommit={([lo, hi]) => {
                    setDraftMinPrice(lo)
                    setDraftMaxPrice(hi)
                  }}
                />
              </div>
            )}

            <div
              className={clx(
                "py-3",
                priceBounds[1] > priceBounds[0] &&
                  "border-t border-[var(--theme-border)]"
              )}
            >
              <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-1">
                Sortează
              </p>
              {sortOptions.map((opt) =>
                row(
                  draftSort === opt.value,
                  () => setDraftSort(opt.value),
                  opt.label
                )
              )}
            </div>

            {colorFacets.length > 0 && (
              <div className="py-3 border-t border-[var(--theme-border)]">
                <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-3">
                  Culoare
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorFacets.map((label) => {
                    const active = draftColors.includes(label)
                    return (
                      <button
                        key={label}
                        onClick={() => toggleDraftColor(label)}
                        className={clx(
                          "px-3 py-1.5 font-sans text-[11px] uppercase tracking-[1px] border transition-colors",
                          active
                            ? "border-hunter-gold text-hunter-gold"
                            : "border-[var(--theme-border)] text-[var(--theme-text-muted)]"
                        )}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 px-5 pt-4 pb-2 bg-[var(--theme-bg)] border-t border-[var(--theme-border)] flex gap-3">
            <button
              onClick={clearFacets}
              disabled={draftFilterCount === 0}
              className="flex-1 h-11 font-sans text-[10px] uppercase tracking-[3px] border border-[var(--theme-border)] text-[var(--theme-text-muted)] whitespace-nowrap disabled:opacity-40"
            >
              Resetează
            </button>
            <button
              onClick={applyDraft}
              className="flex-1 h-11 font-sans text-[10px] uppercase tracking-[3px] bg-hunter-gold text-hunter-dark"
            >
              Arată produsele
            </button>
          </div>
        </div>
      </>
    </div>
  )
}
