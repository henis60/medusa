"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import NewsletterStatus from "./newsletter-status"
import { signout } from "@lib/data/customer"
import { ArrowRightOnRectangle } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"

const FULFILLED_STATUSES = [
  "fulfilled",
  "canceled",
  "returned",
  "partially_returned",
]

const STATUS_LABEL: Record<string, string> = {
  pending: "În așteptare",
  not_fulfilled: "În procesare",
  partially_fulfilled: "Parțial livrată",
  requires_action: "Necesită acțiune",
}

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const [expanded, setExpanded] = useState(false)

  const handleLogout = async () => {
    await signout()
  }

  const activeOrders = orders
    ?.sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
    .filter((o) => !FULFILLED_STATUSES.includes(o.fulfillment_status ?? ""))

  return (
    <div
      className="h-full small:px-8 py-8 flex flex-col justify-between"
      data-testid="overview-page-wrapper"
    >
      <div className="flex flex-col gap-8">
        {/* Member card */}
        <div className="relative bg-[var(--theme-surface-raised)] px-6 py-7 small:px-8">
          <div className="absolute top-0 left-0 right-0 h-px bg-hunter-gold/40" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-hunter-gold/10" />

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <p className="font-cinzel text-[11px] tracking-[4px] text-hunter-gold/60 uppercase leading-none">
                The Hunter House
              </p>
              <p className="font-serif text-[22px] small:text-[26px] leading-none text-[var(--theme-text)]">
                {customer?.first_name} <em>{customer?.last_name}</em>
              </p>
              <p className="font-sans text-[8px] uppercase tracking-[2px] text-[var(--theme-text-muted)]">
                Membru din{" "}
                {customer?.created_at
                  ? new Date(customer.created_at).toLocaleDateString("ro-RO", {
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
            <span className="font-sans text-[8px] uppercase tracking-[3px] text-hunter-gold border border-hunter-gold/40 bg-hunter-gold/5 px-3 py-1.5 shrink-0 self-start">
              Standard
            </span>
          </div>
        </div>
        {/* Active orders */}
        {activeOrders && activeOrders.length > 0 && (
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-4">
              Comenzi active
            </p>
            <div className="flex flex-col divide-y divide-[var(--theme-border)] border border-[var(--theme-border)]">
              {(expanded ? activeOrders : activeOrders.slice(0, 3)).map(
                (order) => (
                  <LocalizedClientLink
                    key={order.id}
                    href={`/account/orders/details/${order.id}`}
                    className="group flex items-center justify-between gap-4 p-4 hover:border-hunter-gold transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-display text-[22px] leading-none text-[var(--theme-text)]">
                        #{order.display_id}
                      </span>
                      <span className="font-sans text-[10px] uppercase tracking-[2px] text-[var(--theme-text-muted)]">
                        {STATUS_LABEL[order.fulfillment_status ?? ""] ??
                          order.fulfillment_status}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-sans text-[13px] tracking-[1px] text-hunter-gold">
                        {convertToLocale({
                          amount: order.total,
                          currency_code: order.currency_code,
                        })}
                      </span>
                    </div>
                  </LocalizedClientLink>
                )
              )}
            </div>
            {activeOrders.length > 3 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-3 font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
              >
                {expanded
                  ? "Restrânge"
                  : `+ ${activeOrders.length - 3} mai mult${
                      activeOrders.length - 3 === 1 ? "ă" : "e"
                    }`}
              </button>
            )}
          </div>
        )}

        {/* Newsletter status */}
        <NewsletterStatus customer={customer} />
      </div>

      {/* Logout — mobile only */}
      <div className="small:hidden mt-8 pt-6 border-t border-[var(--theme-border)]">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
          data-testid="logout-button"
        >
          <ArrowRightOnRectangle className="w-3.5 h-3.5" />
          Deconectare
        </button>
      </div>
    </div>
  )
}

export default Overview
