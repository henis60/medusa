import { HttpTypes } from "@medusajs/types"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const formatStatus = (str: string) => {
  return str.split("_").map(w => w.slice(0, 1).toUpperCase() + w.slice(1)).join(" ")
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  return (
    <div className="px-4 small:px-8 py-6 grid grid-cols-2 small:grid-cols-4 gap-6">
      <div>
        <p className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-1.5">
          Date
        </p>
        <p className="font-sans text-[12px] text-[var(--theme-text)]" data-testid="order-date">
          {new Date(order.created_at).toDateString()}
        </p>
      </div>
      <div>
        <p className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-1.5">
          Email
        </p>
        <p className="font-sans text-[12px] text-[var(--theme-text)] break-all" data-testid="order-email">
          {order.email}
        </p>
      </div>
      {showStatus && (
        <>
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-1.5">
              Fulfillment
            </p>
            <p className="font-sans text-[12px] text-[var(--theme-text)]" data-testid="order-status">
              {formatStatus(order.fulfillment_status)}
            </p>
          </div>
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-1.5">
              Payment
            </p>
            <p className="font-sans text-[12px] text-[var(--theme-text)]" data-testid="order-payment-status">
              {formatStatus(order.payment_status)}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default OrderDetails
