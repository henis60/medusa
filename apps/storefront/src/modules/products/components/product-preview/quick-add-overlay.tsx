"use client"

import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useState, useMemo, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { COLOR_OPTION_NAMES as COLOR_TITLES } from "@lib/util/product"

const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a",
  white: "#f4f2ee",
  "off-white": "#ede8df",
  ivory: "#e8e2d5",
  cream: "#ddd4be",
  beige: "#c8b89a",
  sand: "#b8a688",
  grey: "#8a9198",
  gray: "#8a9198",
  "light grey": "#b8bfc5",
  "light gray": "#b8bfc5",
  "dark grey": "#474f58",
  "dark gray": "#474f58",
  charcoal: "#3a4149",
  navy: "#1e2e45",
  blue: "#4a6d8c",
  "light blue": "#7a9db8",
  "sky blue": "#6a96b0",
  "dark blue": "#1e3055",
  red: "#8c3a3a",
  burgundy: "#5e2530",
  wine: "#5e2530",
  green: "#2d4f38",
  "hunter green": "#1e3d30",
  olive: "#5e5828",
  khaki: "#8a7d52",
  brown: "#5e3a18",
  camel: "#a07d42",
  tan: "#a07840",
  cognac: "#6e3818",
  gold: "#a8883a",
  yellow: "#a89050",
  orange: "#8c4e28",
  pink: "#c4919f",
  "light pink": "#d4a8b2",
  rose: "#b06870",
  blush: "#c09090",
  purple: "#5e4070",
  lilac: "#9a8ab0",
  lavender: "#b0a8c8",
  silver: "#a8adb2",
}

const SIZE_ORDER = [
  "2XS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "XXL",
  "3XL",
  "XXXL",
  "4XL",
  "5XL",
  "6XL",
  "7XL",
  "8XL",
  "9XL",
  "10XL",
  "44",
  "46",
  "48",
  "50",
  "52",
  "54",
  "56",
  "58",
  "60",
  "62",
  "64",
  "66",
  "68",
  "70",
  "72",
  "74",
  "76",
  "78",
  "80",
  "82",
  "84",
  "86",
  "88",
  "90",
  "92",
  "94",
  "96",
  "98",
  "100",
  "102",
  "104",
  "106",
  "108",
  "110",
]

const sortOptionValues = (
  values: HttpTypes.StoreProductOptionValue[],
  isColor: boolean
) => {
  if (isColor) return values
  return [...values].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf((a.value ?? "").toUpperCase())
    const bi = SIZE_ORDER.indexOf((b.value ?? "").toUpperCase())
    if (ai === -1 && bi === -1)
      return (a.value ?? "").localeCompare(b.value ?? "")
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

type Props = {
  variants: HttpTypes.StoreProductVariant[]
  options: HttpTypes.StoreProductOption[]
  productHandle: string
  title?: string
  onVariantSelect?: (variant: HttpTypes.StoreProductVariant | null) => void
  mobileOnly?: boolean
  desktopOnly?: boolean
}

export default function QuickAddOverlay({
  variants,
  options,
  productHandle: _productHandle,
  title,
  onVariantSelect,
  mobileOnly,
  desktopOnly,
}: Props) {
  const countryCode = "ro"
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const dragY = useRef(0)
  const startY = useRef(0)
  const dragging = useRef(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!mobileOpen) {
      setDragOffset(0)
      return
    }
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth
    document.documentElement.style.overflow = "hidden"
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`
    return () => {
      document.documentElement.style.overflow = ""
      document.documentElement.style.paddingRight = ""
    }
  }, [mobileOpen])

  const closeOverlay = () => {
    setSelected({})
    setAdded(false)
    setMobileOpen(false)
  }

  const vmap = (v: HttpTypes.StoreProductVariant) =>
    v.options?.reduce((acc, o) => {
      if (o.option_id) acc[o.option_id] = o.value
      return acc
    }, {} as Record<string, string>) ?? {}

  const getDisabledValues = (optionId: string): Set<string> => {
    const opt = options.find((o) => o.id === optionId)
    const allValues = opt?.values?.map((v) => v.value ?? "") ?? []
    const isColorOpt = COLOR_TITLES.includes(opt?.title?.toLowerCase() ?? "")
    if (isColorOpt) {
      const available = new Set(
        variants.map((v) => vmap(v)[optionId]).filter(Boolean)
      )
      return new Set(allValues.filter((v) => !available.has(v)))
    }
    const others = Object.entries(selected).filter(
      ([id, val]) => id !== optionId && !!val
    ) as [string, string][]
    if (others.length === 0) return new Set()
    const available = new Set<string>()
    variants.forEach((v) => {
      const map = vmap(v)
      if (others.every(([id, val]) => map[id] === val) && map[optionId])
        available.add(map[optionId])
    })
    return new Set(allValues.filter((v) => !available.has(v)))
  }

  const onDragStart = (e: React.TouchEvent) => {
    dragging.current = true
    startY.current = e.touches[0].clientY
    dragY.current = 0
  }
  const onDragMove = (e: React.TouchEvent) => {
    if (!dragging.current) return
    const delta = e.touches[0].clientY - startY.current
    if (delta < 0) return
    dragY.current = delta
    setDragOffset(delta)
  }
  const onDragEnd = () => {
    dragging.current = false
    if (dragY.current > 80) {
      setDragOffset(0)
      closeOverlay()
    } else setDragOffset(0)
  }

  const isColorOption = (option: HttpTypes.StoreProductOption) => {
    const titleMatch = [
      "color",
      "colour",
      "culoare",
      "colors",
      "colours",
    ].includes((option.title ?? "").toLowerCase())
    if (titleMatch) return true
    const vals = option.values ?? []
    if (vals.length === 0) return false
    const mapped = vals.filter(
      (v) => COLOR_MAP[(v.value ?? "").toLowerCase()] !== undefined
    )
    return mapped.length >= Math.ceil(vals.length / 2)
  }

  const selectLabel = useMemo(() => {
    const missing = options.find((o) => !selected[o.id ?? ""])
    if (!missing) return "Selectează"
    const isColor = COLOR_TITLES.includes(missing.title?.toLowerCase() ?? "")
    return isColor ? "Selectează culoarea" : "Selectează mărimea"
  }, [options, selected])

  const mobileTriggerLabel = useMemo(() => {
    const first = options[0]
    if (!first) return "Alege mărimea"
    const isColor = COLOR_TITLES.includes(first.title?.toLowerCase() ?? "")
    return isColor ? "Alege culoarea" : "Alege mărimea"
  }, [options])

  const selectedVariant = useMemo(() => {
    const selectedCount = Object.keys(selected).length
    if (selectedCount === 0) return null
    if (selectedCount < options.length) return null
    return (
      variants.find((v) =>
        v.options?.every((o) => selected[o.option_id ?? ""] === o.value)
      ) ?? null
    )
  }, [selected, variants, options])

  const effectiveVariant = useMemo(() => {
    if (variants.length === 1) return variants[0]
    return selectedVariant
  }, [variants, selectedVariant])

  const inStock = effectiveVariant
    ? !effectiveVariant.manage_inventory ||
      (effectiveVariant.inventory_quantity ?? 0) > 0 ||
      effectiveVariant.allow_backorder
    : false

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!effectiveVariant?.id || adding) return
    setAdding(true)
    await addToCart({
      variantId: effectiveVariant.id,
      quantity: 1,
      countryCode,
    })
    setAdding(false)
    setSelected({})
    setMobileOpen(false)
  }

  const handleOptionClick = (
    e: React.MouseEvent,
    optionId: string,
    value: string
  ) => {
    e.preventDefault()
    e.stopPropagation()
    const opt = options.find((o) => o.id === optionId)
    const isColorOpt = COLOR_TITLES.includes(opt?.title?.toLowerCase() ?? "")
    let next = { ...selected, [optionId]: value }

    if (isColorOpt && next[optionId]) {
      const sizeOpt = options.find(
        (o) => !COLOR_TITLES.includes(o.title?.toLowerCase() ?? "")
      )
      if (sizeOpt) {
        const available = new Set(
          variants
            .filter((v) => vmap(v)[optionId] === next[optionId])
            .map((v) => vmap(v)[sizeOpt.id])
            .filter(Boolean)
        )
        const current = selected[sizeOpt.id]
        if (!current || !available.has(current)) {
          const first = sizeOpt.values?.find((v) =>
            available.has(v.value ?? "")
          )
          if (first?.value) next = { ...next, [sizeOpt.id]: first.value }
        }
      }
    }

    setSelected(next)

    if (onVariantSelect) {
      const count = Object.values(next).filter(Boolean).length
      if (count === options.length) {
        const match =
          variants.find((v) =>
            v.options?.every((o) => next[o.option_id ?? ""] === o.value)
          ) ?? null
        onVariantSelect(match)
      } else if (count === 0) {
        onVariantSelect(null)
      }
    }
  }

  return (
    <>
      {/* Mobile trigger — opens portal bottom sheet */}
      {!desktopOnly && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setMobileOpen(true)
          }}
          className="w-full py-2 font-sans text-[8px] uppercase tracking-[3px] border border-[var(--theme-border)] text-[var(--theme-text-muted)] bg-[var(--theme-bg)] transition-colors duration-150 active:border-hunter-gold active:text-hunter-gold"
          aria-label={mobileTriggerLabel}
        >
          {mobileTriggerLabel}
        </button>
      )}

      {/* Desktop panel — rendered flat, parent handles show/hide */}
      {!mobileOnly && (
        <div
          className="px-3 pt-3 pb-3 flex flex-col gap-2 bg-[var(--theme-bg)] border border-[var(--theme-border)]"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          {options.map((option) => {
            const sortedValues = sortOptionValues(option.values ?? [], false)
            return (
              <div
                key={option.id}
                className="flex items-center gap-1 flex-wrap"
              >
                {sortedValues.map((v) => {
                  const isSelected = selected[option.id ?? ""] === v.value
                  const unavailable = getDisabledValues(option.id ?? "").has(
                    v.value ?? ""
                  )
                  return (
                    <button
                      key={v.id}
                      onClick={(e) =>
                        !unavailable &&
                        handleOptionClick(e, option.id ?? "", v.value ?? "")
                      }
                      disabled={unavailable}
                      className={`min-w-[28px] px-1.5 py-1 font-sans text-[8px] uppercase tracking-[1.5px] border transition-all duration-150 ${
                        isSelected
                          ? "border-hunter-gold bg-hunter-gold text-hunter-dark"
                          : unavailable
                          ? "border-[var(--theme-border)] text-[var(--theme-text-muted)] opacity-30 line-through cursor-not-allowed"
                          : "border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-hunter-gold/60 hover:text-[var(--theme-text)]"
                      }`}
                    >
                      {v.value}
                    </button>
                  )
                })}
              </div>
            )
          })}
          <button
            onClick={handleAdd}
            disabled={
              adding || !inStock || (!effectiveVariant && options.length > 0)
            }
            className="w-full py-2 font-sans text-[8px] uppercase tracking-[4px] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed border"
            style={{
              background: added ? "transparent" : "#c9a84c",
              color: added ? "#c9a84c" : "#0d0d0d",
              borderColor: added ? "#c9a84c" : "transparent",
            }}
          >
            {adding
              ? "Se adaugă…"
              : added
              ? "✓ Adăugat"
              : !effectiveVariant && options.length > 0
              ? selectLabel
              : !inStock
              ? "Stoc epuizat"
              : "Adaugă în coș"}
          </button>
        </div>
      )}

      {/* Mobile portal bottom sheet */}
      {mounted &&
        createPortal(
          <>
            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  key="qao-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 z-[9020] bg-black/50 sm:hidden"
                  onTouchEnd={(e) => {
                    e.preventDefault()
                    ;(
                      window as typeof window & { __overlayClosedAt?: number }
                    ).__overlayClosedAt = Date.now()
                    closeOverlay()
                  }}
                  onClick={closeOverlay}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  key="qao-sheet"
                  initial={{ y: "100%" }}
                  animate={{ y: dragOffset }}
                  exit={{ y: "100%" }}
                  transition={
                    dragging.current
                      ? { duration: 0 }
                      : {
                          duration: 0.38,
                          ease: [0.22, 1, 0.36, 1] as [
                            number,
                            number,
                            number,
                            number
                          ],
                        }
                  }
                  className="fixed inset-x-0 bottom-0 z-[9021] bg-[var(--theme-bg)] border-t border-[var(--theme-border)] sm:hidden"
                >
                  {/* Drag handle */}
                  <div
                    className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
                    onTouchStart={onDragStart}
                    onTouchMove={onDragMove}
                    onTouchEnd={onDragEnd}
                  >
                    <div className="w-10 h-1 rounded-full bg-[var(--theme-border)]" />
                  </div>

                  {/* Header */}
                  {title && (
                    <div
                      className="px-6 py-3 border-b border-[var(--theme-border)] touch-none"
                      onTouchStart={onDragStart}
                      onTouchMove={onDragMove}
                      onTouchEnd={onDragEnd}
                    >
                      <span className="font-sans text-[10px] uppercase tracking-[4px] text-[var(--theme-text-muted)]">
                        {title}
                      </span>
                    </div>
                  )}

                  {/* Options */}
                  <div className="px-6 py-5 flex flex-col gap-6 overflow-y-auto max-h-[50dvh]">
                    {options.map((option) => {
                      const sortedValues = sortOptionValues(
                        option.values ?? [],
                        false
                      )
                      return (
                        <div key={option.id} className="flex flex-col gap-3">
                          <span className="font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)]">
                            {option.title}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {sortedValues.map((v) => {
                              const isSelected =
                                selected[option.id ?? ""] === v.value
                              const unavailable = getDisabledValues(
                                option.id ?? ""
                              ).has(v.value ?? "")
                              return (
                                <button
                                  key={v.id}
                                  onClick={(e) =>
                                    !unavailable &&
                                    handleOptionClick(
                                      e,
                                      option.id ?? "",
                                      v.value ?? ""
                                    )
                                  }
                                  disabled={unavailable}
                                  className={`inline-flex items-center justify-center h-10 min-w-[56px] px-4 border font-sans text-[11px] leading-none uppercase tracking-[2px] transition-colors duration-150 ${
                                    isSelected
                                      ? "border-hunter-gold bg-hunter-gold/10 text-[var(--theme-text)]"
                                      : unavailable
                                      ? "border-[var(--theme-border)] text-[var(--theme-text-muted)] opacity-30 line-through cursor-not-allowed"
                                      : "border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-[var(--theme-text-muted)]"
                                  }`}
                                >
                                  {v.value}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-[var(--theme-border)] flex gap-3">
                    <button
                      onTouchEnd={(e) => {
                        e.preventDefault()
                        closeOverlay()
                      }}
                      onClick={closeOverlay}
                      className="flex-1 py-3 font-sans text-[10px] uppercase tracking-[3px] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-[var(--theme-text-muted)] transition-colors"
                    >
                      Înapoi
                    </button>
                    <button
                      onClick={handleAdd}
                      disabled={
                        adding ||
                        !inStock ||
                        (!effectiveVariant && options.length > 0)
                      }
                      className="flex-[2] py-3 font-sans text-[10px] uppercase tracking-[3px] bg-hunter-gold text-hunter-dark transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {adding
                        ? "Se adaugă…"
                        : added
                        ? "Adăugat ✓"
                        : !effectiveVariant && options.length > 0
                        ? selectLabel
                        : !inStock
                        ? "Stoc epuizat"
                        : "Adaugă în coș"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>,
          document.body
        )}
    </>
  )
}
