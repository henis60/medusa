"use client"

import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useState, useMemo } from "react"
import { COLOR_OPTION_NAMES as COLOR_TITLES } from "@lib/util/product"

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

const sortOptionValues = (values: HttpTypes.StoreProductOptionValue[]) =>
  [...values].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf((a.value ?? "").toUpperCase())
    const bi = SIZE_ORDER.indexOf((b.value ?? "").toUpperCase())
    if (ai === -1 && bi === -1)
      return (a.value ?? "").localeCompare(b.value ?? "")
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

type Props = {
  variants: HttpTypes.StoreProductVariant[]
  options: HttpTypes.StoreProductOption[]
  productHandle: string
  onVariantSelect?: (variant: HttpTypes.StoreProductVariant | null) => void
}

export default function DesktopQuickAdd({
  variants,
  options,
  productHandle: _productHandle,
  onVariantSelect,
}: Props) {
  const countryCode = "ro"
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [adding, setAdding] = useState(false)

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

  const effectiveVariant = useMemo(() => {
    if (variants.length === 1) return variants[0]
    const count = Object.keys(selected).length
    if (count < options.length) return null
    return (
      variants.find((v) =>
        v.options?.every((o) => selected[o.option_id ?? ""] === o.value)
      ) ?? null
    )
  }, [selected, variants, options])

  const inStock = effectiveVariant
    ? !effectiveVariant.manage_inventory ||
      (effectiveVariant.inventory_quantity ?? 0) > 0 ||
      effectiveVariant.allow_backorder
    : false

  const selectLabel = useMemo(() => {
    const missing = options.find((o) => !selected[o.id ?? ""])
    if (!missing) return "Selectează"
    return COLOR_TITLES.includes(missing.title?.toLowerCase() ?? "")
      ? "Selectează culoarea"
      : "Selectează mărimea"
  }, [options, selected])

  const handleOptionClick = (
    e: React.MouseEvent,
    optionId: string,
    value: string
  ) => {
    e.preventDefault()
    e.stopPropagation()
    const opt = options.find((o) => o.id === optionId)
    const isColorOpt = COLOR_TITLES.includes(opt?.title?.toLowerCase() ?? "")
    const toggled = value

    let next = { ...selected, [optionId]: toggled }

    if (isColorOpt && toggled) {
      const sizeOpt = options.find(
        (o) => !COLOR_TITLES.includes(o.title?.toLowerCase() ?? "")
      )
      if (sizeOpt) {
        const available = new Set(
          variants
            .filter((v) => vmap(v)[optionId] === toggled)
            .map((v) => vmap(v)[sizeOpt.id ?? ""])
            .filter(Boolean)
        )
        const first = sizeOpt.values?.find((v) => available.has(v.value ?? ""))
        if (first?.value) next = { ...next, [sizeOpt.id ?? ""]: first.value }
      }
    }

    setSelected(next)

    // notify image change
    if (onVariantSelect) {
      const fullMatch =
        variants.find((v) =>
          v.options?.every((o) => next[o.option_id ?? ""] === o.value)
        ) ?? null
      onVariantSelect(fullMatch)
    }
  }

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
  }

  return (
    <div
      className="hidden sm:block absolute inset-x-0 bottom-0 z-30 bg-[var(--theme-bg)] border border-[var(--theme-border)] translate-y-2 opacity-0 pointer-events-none transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <div className="px-3 pt-3 pb-3 flex flex-col gap-2">
        {options.map((option) => {
          const sortedValues = sortOptionValues(option.values ?? [])
          return (
            <div key={option.id} className="flex items-center gap-1 flex-wrap">
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
          className="w-full py-2 font-sans text-[8px] uppercase tracking-[4px] border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "#c9a84c",
            color: "#0d0d0d",
            borderColor: "transparent",
          }}
        >
          {adding
            ? "Se adaugă…"
            : !effectiveVariant && options.length > 0
            ? selectLabel
            : !inStock
            ? "Stoc epuizat"
            : "Adaugă în coș"}
        </button>
      </div>
    </div>
  )
}
