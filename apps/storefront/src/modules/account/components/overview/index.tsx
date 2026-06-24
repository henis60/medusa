import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import WishlistStat from "./wishlist-stat"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const addressCount = customer?.addresses?.length || 0
  const orderCount = orders?.length || 0

  const stats = [
    { label: "Comenzi", value: orderCount, href: "/account/orders" },
    { label: "Adrese", value: addressCount, href: "/account/addresses" },
  ]

  return (
    <div className="small:px-8 py-8" data-testid="overview-page-wrapper">
      {/* Header */}
      <div className="mb-10 border-b border-[var(--theme-border)] pb-8">
        <div className="flex items-end gap-10">
          {stats.map((s) => (
            <LocalizedClientLink
              key={s.href}
              href={s.href}
              className="group flex flex-col gap-1"
            >
              <span className="font-display text-[40px] leading-none text-[var(--theme-text)] group-hover:text-hunter-gold transition-colors">
                {s.value}
              </span>
              <span className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)]">
                {s.label}
              </span>
            </LocalizedClientLink>
          ))}
          <WishlistStat />
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)]">
            Comenzi recente
          </p>
          <LocalizedClientLink
            href="/account/orders"
            className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-current pb-0.5"
          >
            Vezi toate
          </LocalizedClientLink>
        </div>

        <ul className="flex flex-col" data-testid="orders-wrapper">
          {orders && orders.length > 0 ? (
            orders.slice(0, 3).map((order) => (
              <li
                key={order.id}
                data-testid="order-wrapper"
                data-value={order.id}
                className="last:border-none"
              >
                <LocalizedClientLink
                  href={`/account/orders/details/${order.id}`}
                  className="group flex items-center justify-between py-4 hover:bg-[var(--theme-surface)] px-2 -mx-2 transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="font-sans text-[11px] uppercase tracking-[2px] text-[var(--theme-text)]"
                      data-testid="order-id"
                      data-value={order.display_id}
                    >
                      #{order.display_id}
                    </span>
                    <span
                      className="font-serif italic text-[13px] text-[var(--theme-text-muted)]"
                      data-testid="order-created-date"
                    >
                      {new Date(order.created_at).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span
                      className="font-display text-[14px] leading-none text-[var(--theme-gold)]"
                      data-testid="order-amount"
                    >
                      {convertToLocale({
                        amount: order.total,
                        currency_code: order.currency_code,
                      })}
                    </span>
                    <span className="text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </LocalizedClientLink>
              </li>
            ))
          ) : (
            <li
              className="py-10 text-center"
              data-testid="no-orders-message"
            >
              <p className="font-display text-[20px] leading-[1.1] text-[var(--theme-text)] mb-2">
                Nicio comandă încă
              </p>
              <p className="font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-6">
                Descoperă colecția
              </p>
              <LocalizedClientLink
                href="/store"
                className="inline-block font-sans text-[10px] uppercase tracking-[3px] text-hunter-dark bg-hunter-gold px-6 py-3 hover:bg-hunter-gold/90 transition-colors"
              >
                Cumpără acum
              </LocalizedClientLink>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default Overview
