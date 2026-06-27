"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useCallback } from "react"
import CardImages from "./card-images"
import DesktopQuickAdd from "./desktop-quick-add"
import { isInStoreOnly } from "@lib/util/product"

// Reveals on hover anywhere over the card link (group), floating above the
// image bottom with an inset gap from the edges.
function HoverOverlay({
  dark,
  children,
}: {
  dark?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`hidden sm:block absolute inset-x-3 bottom-3 z-30 py-3 font-sans text-[10px] uppercase tracking-[3px] border text-center backdrop-blur-sm pointer-events-none translate-y-3 opacity-0 transition-all duration-[400ms] ease-out group-hover:translate-y-0 group-hover:opacity-100 ${
        dark
          ? "border-white/40 text-white bg-black/40"
          : "border-[var(--theme-border)] text-[var(--theme-text)] bg-[var(--theme-bg)]/90"
      }`}
    >
      {children}
    </div>
  )
}

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
      setActiveImage(url ?? null)
    },
    [allImages, options, variants]
  )

  return (
    <div>
      <CardImages
        product={product}
        isFeatured={isFeatured}
        noOverlay={!!forceDark}
        activeImage={activeImage}
        onVariantSelect={handleVariantSelect}
      />

      {/* Desktop overlays — revealed on hover anywhere over the card link */}
      {!forceDark && !isInStoreOnly(product) && (
        <DesktopQuickAdd
          variants={variants}
          options={options}
          productHandle={product.handle ?? ""}
          onVariantSelect={handleVariantSelect}
        />
      )}
      {!forceDark && isInStoreOnly(product) && (
        <HoverOverlay>Disponibil în magazin</HoverOverlay>
      )}
    </div>
  )
}
