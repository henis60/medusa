import { clx } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-[var(--theme-surface)] animate-pulse" />
  }

  return (
    <div className="flex flex-col gap-y-1">
      <span
        className={clx("font-display text-3xl text-hunter-gold", {
          "text-hunter-gold-b": selectedPrice.price_type === "sale",
        })}
      >
        {!variant && "From "}
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </span>
      {selectedPrice.price_type === "sale" && (
        <p className="text-sm text-[var(--theme-text-muted)]">
          <span className="line-through" data-testid="original-product-price">
            {selectedPrice.original_price}
          </span>
          <span className="ml-2 text-hunter-gold">
            -{selectedPrice.percentage_diff}%
          </span>
        </p>
      )}
    </div>
  )
}
