"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import isEqual from "lodash/isEqual"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"
import {
  isInStoreOnly,
  COLOR_OPTION_NAMES as COLOR_TITLES,
} from "@lib/util/product"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>(
    () => {
      if (product.variants?.length) {
        return optionsAsKeymap(product.variants[0].options) ?? {}
      }
      return {}
    }
  )
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = "ro"

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const isColorOpt = (optId: string) =>
    COLOR_TITLES.includes(
      product.options?.find((o) => o.id === optId)?.title?.toLowerCase() ?? ""
    )

  const variantMap = (v: HttpTypes.StoreProductVariant) =>
    v.options?.reduce((acc, o) => {
      if (o.option_id) acc[o.option_id] = o.value
      return acc
    }, {} as Record<string, string>) ?? {}

  const variantInStock = (v: HttpTypes.StoreProductVariant) => {
    if (!v.manage_inventory) return true
    if (v.allow_backorder) return true
    return (v.inventory_quantity || 0) > 0
  }

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => {
      const next = { ...prev, [optionId]: value }
      if (isColorOpt(optionId)) {
        // When color changes, keep current size if available, else pick first available
        const sizeOpt = product.options?.find(
          (o) => !COLOR_TITLES.includes(o.title?.toLowerCase() ?? "")
        )
        if (sizeOpt) {
          const available = new Set(
            (product.variants ?? [])
              .filter((v) => variantMap(v)[optionId] === value)
              .map((v) => variantMap(v)[sizeOpt.id])
              .filter(Boolean)
          )
          const current = prev[sizeOpt.id]
          if (!current || !available.has(current)) {
            const first = sizeOpt.values?.find((v) =>
              available.has(v.value ?? "")
            )
            if (first?.value) next[sizeOpt.id] = first.value
          }
        }
      }
      return next
    })
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  // check if the whole product is out of stock (no purchasable variant)
  const productOutOfStock = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return false
    }
    return !product.variants.some((v) => {
      if (!v.manage_inventory) return true
      if (v.allow_backorder) return true
      return (v.inventory_quantity || 0) > 0
    })
  }, [product.variants])

  const getDisabledValues = (optionId: string): Set<string> => {
    const allValues =
      product.options
        ?.find((o) => o.id === optionId)
        ?.values?.map((v) => v.value ?? "") ?? []
    if (isColorOpt(optionId)) {
      // Color: only disable if no variant exists for that color at all
      const available = new Set(
        (product.variants ?? [])
          .map((v) => variantMap(v)[optionId])
          .filter(Boolean)
      )
      return new Set(allValues.filter((v) => !available.has(v)))
    }
    // Size: mark as unavailable if no matching variant exists OR it's out of stock
    const others = Object.entries(options).filter(
      ([id, val]) => id !== optionId && !!val
    ) as [string, string][]
    if (others.length === 0) return new Set()
    const available = new Set<string>()
    product.variants?.forEach((v) => {
      const map = variantMap(v)
      if (
        others.every(([id, val]) => map[id] === val) &&
        map[optionId] &&
        variantInStock(v)
      ) {
        available.add(map[optionId])
      }
    })
    return new Set(allValues.filter((v) => !available.has(v)))
  }

  const actionsRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(buttonRef, "0px", 1)

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
    })

    setIsAdding(false)
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {product.material && (
                <div
                  className="flex flex-col gap-y-3"
                  data-testid="product-material"
                >
                  <span className="font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)]">
                    Material
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.material.split(",").map((m) => {
                      const value = m.trim()
                      if (!value) return null
                      return (
                        <span
                          key={value}
                          className="inline-flex items-center justify-center h-8 px-3 bg-[var(--theme-surface)] font-serif text-sm text-[var(--theme-text)] cursor-default select-none"
                        >
                          {value}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                      disabledValues={getDisabledValues(option.id)}
                      variants={product.variants}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        <div ref={buttonRef}>
          {isInStoreOnly(product) ? (
            <div className="w-full font-sans text-[8px] uppercase tracking-[4px] text-[#cfd8d2] border border-[rgba(207,216,210,0.35)] px-3 py-[10px] text-center cursor-default">
              Disponibil în magazin
            </div>
          ) : (
            <Button
              onClick={handleAddToCart}
              disabled={
                !inStock ||
                !selectedVariant ||
                !!disabled ||
                isAdding ||
                !isValidVariant
              }
              variant="primary"
              className="w-full h-12 rounded-none !bg-hunter-gold !text-hunter-dark !border-transparent hover:!bg-hunter-gold-b font-sans uppercase tracking-[3px] text-[11px] transition-colors disabled:!bg-[var(--theme-surface)] disabled:!text-[var(--theme-text-muted)]"
              isLoading={isAdding}
              data-testid="add-product-button"
            >
              {productOutOfStock
                ? "Indisponibil"
                : !selectedVariant && !options
                ? "Alege varianta"
                : !inStock || !isValidVariant
                ? "Indisponibil"
                : "Adaugă în coș"}
            </Button>
          )}
        </div>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
