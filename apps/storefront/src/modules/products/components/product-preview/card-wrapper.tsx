"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useCallback } from "react"
import CardImages from "./card-images"
import DesktopQuickAdd from "./desktop-quick-add"
import { isInStoreOnly } from "@lib/util/product"
import { resolveImageUrl } from "@lib/util/image-url"

const COLOR_OPTION_NAMES = ["color", "colour", "culoare"]

function getVariantImage(
  variant: HttpTypes.StoreProductVariant,
  allImages: HttpTypes.StoreProductImage[],
  options: HttpTypes.StoreProductOption[],
  allVariants: HttpTypes.StoreProductVariant[]
): string | null {
  if (variant.images?.length) {
    return (variant.images[0] as HttpTypes.StoreProductImage).url ?? null
  }
  const colorOption = options.find((o) =>
    COLOR_OPTION_NAMES.includes(o.title?.toLowerCase() ?? "")
  )
  if (!colorOption || !allImages.length) return null
  const colorValues = [
    ...new Set(
      allVariants
        .map(
          (v) => v.options?.find((o) => o.option_id === colorOption.id)?.value
        )
        .filter(Boolean) as string[]
    ),
  ]
  const variantColor = variant.options?.find(
    (o) => o.option_id === colorOption.id
  )?.value
  const idx = variantColor ? colorValues.indexOf(variantColor) : -1
  return idx >= 0 && idx < allImages.length ? allImages[idx].url ?? null : null
}

type Props = {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  forceDark?: boolean
}

export default function CardWrapper({ product, isFeatured, forceDark }: Props) {
  const allImages = product.images ?? []
  const variants = product.variants ?? []
  const options = product.options ?? []

  const [activeImage, setActiveImage] = useState<string | null>(null)

  const handleVariantSelect = useCallback(
    (variant: HttpTypes.StoreProductVariant | null) => {
      if (!variant) {
        setActiveImage(null)
        return
      }
      const url = getVariantImage(variant, allImages, options, variants)
      setActiveImage(resolveImageUrl(url) ?? null)
    },
    [allImages, options, variants]
  )

  return (
    <>
      <CardImages
        product={product}
        isFeatured={isFeatured}
        noOverlay={!!forceDark}
        activeImage={activeImage}
        onVariantSelect={handleVariantSelect}
      />

      {/* Desktop overlays */}
      {!forceDark && !isInStoreOnly(product) && (
        <DesktopQuickAdd
          variants={variants}
          options={options}
          productHandle={product.handle ?? ""}
          onVariantSelect={handleVariantSelect}
        />
      )}
      {!forceDark && isInStoreOnly(product) && (
        <div className="hidden sm:block absolute inset-x-0 bottom-0 z-30 py-2 font-sans text-[8px] uppercase tracking-[3px] border border-[var(--theme-border)] text-[var(--theme-text-muted)] bg-[var(--theme-bg)] text-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          Disponibil în magazin
        </div>
      )}
      {forceDark && (
        <div className="hidden sm:block absolute inset-x-0 bottom-0 z-30 !py-2 font-sans text-[8px] uppercase tracking-[3px] border border-white/30 text-white/80 text-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          Vezi detalii
        </div>
      )}
    </>
  )
}
