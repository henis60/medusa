import { HttpTypes } from "@medusajs/types"
import Item from "@modules/order/components/item"

type ItemsProps = {
  order: HttpTypes.StoreOrder
}

const Items = ({ order }: ItemsProps) => {
  const items = order.items?.sort((a, b) =>
    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
  )

  return (
    <div className="px-4 small:px-8 py-6">
      <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-5">
        Items
      </p>
      <div className="flex flex-col gap-5" data-testid="products-table">
        {items?.map((item) => (
          <Item key={item.id} item={item} currencyCode={order.currency_code} />
        ))}
      </div>
    </div>
  )
}

export default Items
