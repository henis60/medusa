import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const profilePct = getProfileCompletion(customer)
  const addressCount = customer?.addresses?.length || 0

  return (
    <div className="small:px-8 py-8" data-testid="overview-page-wrapper">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-px border border-[var(--theme-border)] mb-10">
        <div className="p-6 bg-[var(--theme-surface)]">
          <p className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-3">
            Profile
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className="font-display text-[38px] leading-none text-[var(--theme-text)]"
              data-testid="customer-profile-completion"
              data-value={profilePct}
            >
              {profilePct}
            </span>
            <span className="font-sans text-[9px] uppercase tracking-[2px] text-[var(--theme-text-muted)]">
              % complete
            </span>
          </div>
        </div>
        <div className="p-6 bg-[var(--theme-surface)]">
          <p className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-3">
            Addresses
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className="font-display text-[38px] leading-none text-[var(--theme-text)]"
              data-testid="addresses-count"
              data-value={addressCount}
            >
              {addressCount}
            </span>
            <span className="font-sans text-[9px] uppercase tracking-[2px] text-[var(--theme-text-muted)]">
              saved
            </span>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)]">
            Recent Orders
          </p>
          <LocalizedClientLink
            href="/account/orders"
            className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-current pb-0.5"
          >
            View all
          </LocalizedClientLink>
        </div>

        <ul className="flex flex-col" data-testid="orders-wrapper">
          {orders && orders.length > 0 ? (
            orders.slice(0, 5).map((order) => (
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
                      {new Date(order.created_at).toDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span
                      className="font-display text-[18px] leading-none text-[var(--theme-gold)]"
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
                No orders yet
              </p>
              <p className="font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-6">
                Discover the collection
              </p>
              <LocalizedClientLink
                href="/store"
                className="inline-block font-sans text-[10px] uppercase tracking-[3px] text-hunter-dark bg-hunter-gold px-6 py-3 hover:bg-hunter-gold/90 transition-colors"
              >
                Shop Now
              </LocalizedClientLink>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0
  if (!customer) return 0
  if (customer.email) count++
  if (customer.first_name && customer.last_name) count++
  if (customer.phone) count++
  if (customer.addresses?.find((addr) => addr.is_default_billing)) count++
  return (count / 4) * 100
}

export default Overview
