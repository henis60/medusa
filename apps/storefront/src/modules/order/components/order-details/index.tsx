import { HttpTypes } from "@medusajs/types"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const STATUS_RO: Record<string, string> = {
  pending: "În așteptare",
  not_fulfilled: "Nelivrată",
  fulfilled: "Livrată",
  partially_fulfilled: "Parțial livrată",
  canceled: "Anulată",
  returned: "Returnată",
  partially_returned: "Parțial returnată",
  requires_action: "Necesită acțiune",
  captured: "Capturat",
  refunded: "Rambursat",
  partially_refunded: "Parțial rambursat",
  awaiting: "În așteptare",
  not_paid: "Neachitată",
  paid: "Achitată",
}

const formatStatus = (str: string) =>
  STATUS_RO[str] ??
  str
    .split("_")
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(" ")

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  return (
    <div className="small:px-8 py-6 grid grid-cols-2 small:grid-cols-4 gap-6">
      <div>
        <p className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-1.5">
          Data
        </p>
        <p
          className="font-sans text-[12px] text-[var(--theme-text)]"
          data-testid="order-date"
        >
          {new Date(order.created_at).toLocaleDateString("ro-RO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
      <div>
        <p className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-1.5">
          Email
        </p>
        <p
          className="font-sans text-[12px] text-[var(--theme-text)] break-all"
          data-testid="order-email"
        >
          {order.email}
        </p>
      </div>
      {showStatus && (
        <>
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-1.5">
              Livrare
            </p>
            <p
              className="font-sans text-[12px] text-[var(--theme-text)]"
              data-testid="order-status"
            >
              {formatStatus(order.fulfillment_status)}
            </p>
          </div>
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-1.5">
              Plată
            </p>
            <p
              className="font-sans text-[12px] text-[var(--theme-text)]"
              data-testid="order-payment-status"
            >
              {formatStatus(order.payment_status)}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default OrderDetails
