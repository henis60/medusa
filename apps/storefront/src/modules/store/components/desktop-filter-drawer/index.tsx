"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { clx } from "@modules/common/components/ui"
import PriceRangeSlider from "@modules/store/components/price-range-slider"
import { useStoreFacets } from "@modules/store/context/store-facets-context"

function FilterIcon() {
  return (
    <svg
      width="14"
      height="14"
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

export default function DesktopFilterDrawer() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { priceBounds, colorFacets } = useStoreFacets()
  const [open, setOpen] = useState(false)

  // Applied filters — what the grid actually reflects right now.
  const appliedMinPrice = Number(searchParams.get("minPrice")) || priceBounds[0]
  const appliedMaxPrice = Number(searchParams.get("maxPrice")) || priceBounds[1]
  const appliedColors = (searchParams.get("color") ?? "")
    .split(",")
    .filter(Boolean)
  const priceActive =
    !!searchParams.get("minPrice") || !!searchParams.get("maxPrice")
  const filterCount = (priceActive ? 1 : 0) + (appliedColors.length > 0 ? 1 : 0)

  // Draft — edited inside the drawer, only applied to the URL (and the
  // grid) when "Arată produsele" is pressed.
  const [draftMinPrice, setDraftMinPrice] = useState(appliedMinPrice)
  const [draftMaxPrice, setDraftMaxPrice] = useState(appliedMaxPrice)
  const [draftColors, setDraftColors] = useState(appliedColors)

  // Re-sync the draft from the URL every time the drawer opens.
  useEffect(() => {
    if (!open) return
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={clx(
          "flex items-center gap-2 font-sans text-[10px] uppercase tracking-[3px] transition-colors",
          filterCount > 0
            ? "text-hunter-gold"
            : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
        )}
      >
        <FilterIcon />
        Filtru
      </button>

      {/* Backdrop — above the sticky nav (z-[9001]) so the drawer covers it too */}
      <div
        className={clx(
          "fixed inset-0 z-[9020] bg-black/40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
        style={{ pointerEvents: open ? "auto" : "none" }}
        onClick={() => setOpen(false)}
      />

      {/* Right-side drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[9021] w-[380px] max-w-[90vw] bg-[var(--theme-bg)] border-l border-[var(--theme-border)] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateX(${open ? "0%" : "100%"})` }}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-8 h-16 border-b border-[var(--theme-border)] shrink-0">
          <span className="font-sans text-[10px] uppercase tracking-[4px] text-[var(--theme-text)]">
            Filtru
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Închide"
            className="w-7 h-7 flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 1L11 11M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-2 flex-1">
          {priceBounds[1] > priceBounds[0] && (
            <div className="py-4">
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

          {colorFacets.length > 0 && (
            <div
              className={clx(
                "py-4",
                priceBounds[1] > priceBounds[0] &&
                  "border-t border-[var(--theme-border)]"
              )}
            >
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
                          : "border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-[var(--theme-text-muted)]"
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

        <div className="px-6 pt-4 pb-6 border-t border-[var(--theme-border)] flex gap-3 shrink-0">
          <button
            onClick={clearFacets}
            disabled={draftFilterCount === 0}
            className="flex-1 h-11 font-sans text-[10px] uppercase tracking-[3px] border border-[var(--theme-border)] text-[var(--theme-text-muted)] whitespace-nowrap disabled:opacity-40 hover:border-[var(--theme-text-muted)] transition-colors"
          >
            Resetează
          </button>
          <button
            onClick={applyDraft}
            className="flex-1 h-11 font-sans text-[10px] uppercase tracking-[3px] bg-hunter-gold text-hunter-dark hover:opacity-90 transition-opacity"
          >
            Arată produsele
          </button>
        </div>
      </div>
    </>
  )
}
