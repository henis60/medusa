import { HttpTypes } from "@medusajs/types"
import Item from "@modules/cart/components/item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
    ?.slice()
    .sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))

  return (
    <div className="flex flex-col divide-y divide-[var(--theme-border)]">
      {items?.map((item) => (
        <Item key={item.id} item={item} currencyCode={cart?.currency_code ?? ""} />
      ))}
    </div>
  )
}

export default ItemsTemplate
