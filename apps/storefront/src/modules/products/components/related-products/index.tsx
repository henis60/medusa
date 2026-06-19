import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)
  if (!region) return null

  // Fetch all products with full fields
  const { response: allResponse } = await listProducts({
    queryParams: {
      limit: 100,
      region_id: region.id,
      fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,+type",
    },
    countryCode,
  })

  // "Fits with" — other products that have a tag whose value matches the current product's handle
  const currentHandle = product.handle ?? ""
  const fitsWithProducts = allResponse.products.filter(
    (p) => p.id !== product.id && (p.tags ?? []).some((t) => t.value?.trim() === currentHandle)
  )

  // "You may also like" — same collection, excluding current + fits-with
  const excludeIds = new Set([product.id, ...fitsWithProducts.map((p) => p.id)])
  const similarProducts = allResponse.products.filter(
    (p) =>
      !excludeIds.has(p.id) &&
      product.collection_id &&
      p.collection_id === product.collection_id
  )

  if (!fitsWithProducts.length && !similarProducts.length) return null

  return (
    <>
      {fitsWithProducts.length > 0 && (
        <div className="border-t border-[var(--theme-border)] content-container py-16">
          <div className="mb-10">
            <p className="font-sans text-[9px] uppercase tracking-[8px] text-hunter-green dark:text-hunter-green-m mb-3">
              Complete the look
            </p>
            <h2 className="font-display text-3xl text-[var(--theme-text)]">
              Se potrivește <span className="italic text-hunter-gold">cu</span>
            </h2>
          </div>
          <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-5 gap-y-10">
            {fitsWithProducts.map((p) => (
              <li key={p.id}>
                <Product region={region} product={p} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {similarProducts.length > 0 && (
        <div className="border-t border-[var(--theme-border)] content-container py-16">
          <div className="mb-10">
            <p className="font-sans text-[9px] uppercase tracking-[8px] text-hunter-green dark:text-hunter-green-m mb-3">
              You may also like
            </p>
            <h2 className="font-display text-3xl text-[var(--theme-text)]">
              Related <span className="italic text-hunter-gold">products</span>
            </h2>
          </div>
          <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-5 gap-y-10">
            {similarProducts.map((p) => (
              <li key={p.id}>
                <Product region={region} product={p} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
