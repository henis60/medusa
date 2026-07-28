import { HttpTypes } from "@medusajs/types"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import Image from "next/image"
import { getCartItemImageUrl } from "@lib/util/variant-image"
import { getTranslations } from "next-intl/server"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}

const Item = async ({ item, currencyCode }: ItemProps) => {
  const t = await getTranslations("order")
  const imgSrc = getCartItemImageUrl(item)

  return (
    <div className="flex gap-4" data-testid="product-row">
      <div className="relative shrink-0 w-[72px] aspect-[3/4] overflow-hidden bg-[var(--theme-surface)]">
        {imgSrc && (
          <Image
            src={imgSrc}
            alt={item.product_title ?? ""}
            fill
            className="object-cover object-center"
            sizes="72px"
          />
        )}
      </div>
      <div className="flex flex-1 min-w-0 items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p
            className="font-display text-[17px] leading-[1.2] text-[var(--theme-text)]"
            data-testid="product-name"
          >
            {item.product_title}
          </p>
          <LineItemOptions
            variant={item.variant}
            data-testid="product-variant"
          />
          <span
            className="font-sans text-[10px] text-[var(--theme-text-muted)]"
            data-testid="product-quantity"
          >
            {t("Cant: {quantity}", { quantity: item.quantity })}
          </span>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-0.5">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
          <div className="font-display text-[15px] text-hunter-gold">
            <LineItemPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Item
