import { HttpTypes } from "@medusajs/types";

export const isSimpleProduct = (product: HttpTypes.StoreProduct): boolean => {
    return product.options?.length === 1 && product.options[0].values?.length === 1;
}

export const isInStoreOnly = (product: HttpTypes.StoreProduct): boolean => {
    return product.type?.value === "in-store-only"
}

/** Option titles treated as the "color" axis (case-insensitive). */
export const COLOR_OPTION_NAMES = ["color", "colour", "culoare"]

export const isColorOption = (title?: string | null): boolean =>
    COLOR_OPTION_NAMES.includes((title ?? "").toLowerCase())

/**
 * Variants sorted by `variant_rank`. The Store/Admin APIs do not themselves
 * sort the `variants` relation by it (see colorOrdered() in
 * option-select.tsx for how this was found) — anything that treats
 * `product.variants[0]` or `.find(...)` order as "display order" (initial
 * selection, color swatch order, gallery default) must sort through this
 * first, or it silently falls back to whatever order the API happened to
 * return, which does not follow the images/variant order set in Galerie
 * media.
 */
export function sortedVariants(
    product: HttpTypes.StoreProduct
): HttpTypes.StoreProductVariant[] {
    return [...(product.variants ?? [])].sort(
        (a, b) => (a.variant_rank ?? 0) - (b.variant_rank ?? 0)
    )
}

/**
 * Images to show for a selected variant: the variant's own images if it has
 * any, otherwise all product images. Shared by the product and preview pages.
 */
export function getImagesForVariant(
    product: HttpTypes.StoreProduct,
    selectedVariantId?: string
): HttpTypes.StoreProductImage[] | null | undefined {
    if (!selectedVariantId || !product.variants) {
        return product.images
    }
    const variant = product.variants.find((v) => v.id === selectedVariantId)
    if (!variant || !variant.images?.length) {
        return product.images
    }
    const imageIds = new Set(variant.images.map((i) => i.id))
    return product.images?.filter((i) => imageIds.has(i.id)) ?? null
}