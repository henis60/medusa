import { HttpTypes } from "@medusajs/types"
import { COLOR_OPTION_NAMES } from "@lib/util/product"

type ImageLike = { id?: string; url?: string; rank?: number | null }

/**
 * The cart endpoint returns image relations WITHOUT a guaranteed order
 * (unlike /store/products which sorts by rank), so always sort by rank
 * before picking "the first" image — otherwise the cart shows a different
 * image than the product page for the same variant.
 */
const byRank = (images: ImageLike[]): ImageLike[] =>
  [...images].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

/**
 * Resolve the display image for a cart line item's variant, mirroring the
 * product-card logic (variant thumbnail → variant images → color-index
 * mapping into product images → product fallbacks).
 */
export function getCartItemImageUrl(
  item: HttpTypes.StoreCartLineItem
): string | null {
  const variant = item.variant as any
  const product = variant?.product
  if (!variant || !product) return item.thumbnail ?? null

  // 1. Variant-specific thumbnail (set in Medusa admin per variant)
  if (variant.thumbnail) return variant.thumbnail

  const allImages = byRank(product.images ?? [])

  // 2. Variant-specific images: the variant's own first image by rank
  if (variant.images?.length) {
    return byRank(variant.images)[0]?.url ?? null
  }

  // 3. Map by color option index → product images
  const options: {
    id?: string
    title?: string
    values?: { value?: string }[]
  }[] = product.options ?? []
  const colorOption = options.find((o) =>
    COLOR_OPTION_NAMES.includes(o?.title?.toLowerCase() ?? "")
  )

  if (colorOption && allImages.length) {
    // Color order MUST be derived from the variants (same as the product
    // card's getVariantImage) — variant creation order matches the image
    // upload order. options.values has its own ordering and using it made
    // the cart show a different image than the product page.
    const allVariants: any[] = product.variants ?? []
    const colorValues: string[] = Array.from(
      new Set(
        allVariants
          .map(
            (v: any) =>
              v.options?.find((o: any) => o.option_id === colorOption.id)
                ?.value
          )
          .filter(Boolean) as string[]
      )
    )

    // Fallback: options.values if variants aren't in the payload.
    if (!colorValues.length) {
      colorValues.push(
        ...(colorOption.values ?? [])
          .map((v) => v.value)
          .filter((v): v is string => !!v)
      )
    }

    const variantColor = variant.options?.find(
      (o: { option_id?: string }) => o.option_id === colorOption.id
    )?.value
    const idx = variantColor ? colorValues.indexOf(variantColor) : -1
    if (idx >= 0 && idx < allImages.length) return allImages[idx].url ?? null
  }

  // 4. First product image
  if (allImages.length) return allImages[0].url ?? null

  // 5. Product thumbnail
  if (product.thumbnail) return product.thumbnail

  // 6. Line item thumbnail as last resort
  return item.thumbnail ?? null
}
