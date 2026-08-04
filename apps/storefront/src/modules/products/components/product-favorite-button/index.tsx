"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { HttpTypes } from "@medusajs/types"
import { useFavorites } from "@lib/context/favorites-context"
import { useSelectedVariant } from "@modules/products/context/selected-variant-context"

type Props = {
  productId: string
  productHandle: string
  productTitle: string
  productThumbnail: string | null
  variants?: HttpTypes.StoreProductVariant[] | null
}

export default function ProductFavoriteButton({ productId, productHandle, productTitle, productThumbnail, variants }: Props) {
  const t = useTranslations("products")
  const { isFavorite, toggle } = useFavorites()
  const [mounted, setMounted] = useState(false)

  // Follows whichever variant (e.g. color) is currently selected on the
  // product page, so saving/removing acts on that specific variant rather
  // than always the first one.
  const selectedVariantId = useSelectedVariant() ?? variants?.[0]?.id ?? null
  const selectedVariant = variants?.find((v) => v.id === selectedVariantId) ?? null

  const variantThumbnail =
    (selectedVariant?.images as HttpTypes.StoreProductImage[] | undefined)?.[0]?.url ??
    productThumbnail
  const variantTitle =
    ((selectedVariant as any)?.options as { value?: string }[] | undefined)
      ?.map((o) => o.value)
      .filter(Boolean)
      .join(" · ") ||
    selectedVariant?.title ||
    null

  useEffect(() => setMounted(true), [])

  // Avoid hydration mismatch: favorites come from localStorage, which isn't
  // available on the server. Render the default (unfavorited) state until mounted.
  const on = mounted && isFavorite(productId, selectedVariantId)

  return (
    <button
      type="button"
      aria-label={on ? t("Elimină din salvate") : t("Salvează")}
      aria-pressed={on}
      onClick={() =>
        toggle({
          id: productId,
          variantId: selectedVariantId,
          variantTitle,
          handle: productHandle,
          title: productTitle,
          thumbnail: variantThumbnail,
        })
      }
      className="shrink-0 transition-colors duration-150"
      style={{ color: on ? "#c9a84c" : "var(--theme-text-muted)" }}
    >
      <svg viewBox="0 0 24 24" width={20} height={20} fill={on ? "#c9a84c" : "none"} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  )
}
