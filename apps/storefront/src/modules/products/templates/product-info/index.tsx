import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info" className="flex flex-col gap-y-4">
      {(product.collection || product.categories?.length) && (
        <div className="flex items-center gap-3 flex-wrap">
          {product.collection && (
            <LocalizedClientLink
              href={`/collections/${product.collection.handle}`}
              className="font-sans text-[9px] uppercase tracking-[6px] text-hunter-green dark:text-hunter-green-m hover:text-hunter-gold transition-colors"
            >
              {product.collection.title}
            </LocalizedClientLink>
          )}
          {product.collection && product.categories?.length && (
            <span className="text-[var(--theme-border)] text-[9px]">/</span>
          )}
          {product.categories?.map((cat) => (
            <LocalizedClientLink
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className="font-sans text-[9px] uppercase tracking-[6px] text-hunter-green dark:text-hunter-green-m hover:text-hunter-gold transition-colors"
            >
              {cat.name}
            </LocalizedClientLink>
          ))}
        </div>
      )}
      <Heading
        level="h2"
        className="font-display text-4xl leading-tight text-[var(--theme-text)]"
        data-testid="product-title"
      >
        {product.title}
      </Heading>
      {product.description && (
        <Text
          className="font-serif text-base leading-relaxed text-[var(--theme-text-muted)] whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      )}
    </div>
  )
}

export default ProductInfo
