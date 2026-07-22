"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import React, { useState } from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
  // True on the standalone /comanda/[id] success page, which has no
  // AccountNav around it to supply a mobile title bar — false (default) for
  // the /profil/comenzi/[displayId] account page, which does.
  standalone?: boolean
  // False when the viewer isn't the order's own logged-in customer — only
  // possible on the standalone page, reachable by guests right after
  // checkout. Hide the button rather than show it and fail on click: the
  // account page never passes this, so it defaults to visible there.
  canDownloadInvoice?: boolean
}

// On mobile each section reads as a bordered card (the account pages'
// visual motif); on desktop the border disappears and the parent's
// divide-y hairlines take over. Horizontal padding is mobile-only —
// the section components bring their own small:px-8.
const Section = ({ children }: { children: React.ReactNode }) => (
  <div className="border border-[var(--theme-border)] px-4 small:px-0 small:border-0">
    {children}
  </div>
)

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
  standalone,
  canDownloadInvoice = true,
}) => {
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const handleDownloadInvoice = async () => {
    setDownloading(true)
    setDownloadError(null)
    try {
      const response = await fetch(`/api/invoice/${order.id}`)
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        setDownloadError(
          err.message ?? err.error ?? "Factura nu este disponibilă încă."
        )
        return
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `factura-${order.display_id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setDownloadError("Eroare la descărcarea facturii.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header — on the account page, mobile gets its title from
          AccountNav's mobile bar instead, so it's hidden here below small: */}
      <div
        className={
          standalone
            ? "flex flex-col items-start gap-3 pb-6 small:px-8 small:pt-8"
            : "hidden small:flex small:flex-col small:items-start gap-3 small:px-8 small:pt-8 small:pb-6"
        }
      >
        <LocalizedClientLink
          href={standalone ? "/" : "/profil/comenzi"}
          className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-current pb-0.5"
          data-testid="back-to-overview-button"
        >
          {standalone ? "← Acasă" : "← Înapoi la comenzi"}
        </LocalizedClientLink>
        <h1 className="font-display text-[28px] small:text-[32px] leading-[1] text-[var(--theme-text)]">
          Comanda #{order.display_id}
        </h1>
      </div>

      {/* Mobile: bordered cards (matching the account menu / active orders);
          desktop: flat sections with hairline dividers, as before. */}
      <div
        className="flex-1 flex flex-col gap-5 small:gap-0 small:divide-y small:divide-[var(--theme-border)]"
        data-testid="order-details-container"
      >
        {/* Products lead the page, flat (no card) */}
        <Items order={order} />
        <Section>
          <OrderDetails order={order} showStatus />
        </Section>
        <Section>
          <ShippingDetails order={order} />
        </Section>
        <Section>
          <OrderSummary order={order} />
        </Section>

        {/* Invoice download — primary action */}
        {canDownloadInvoice && (
          <div className="small:px-8 pt-1 small:pt-6 pb-2 small:pb-8 !border-t-0 flex flex-col small:items-end">
            <button
              onClick={handleDownloadInvoice}
              disabled={downloading}
              className="w-full small:w-auto h-12 small:px-8 bg-hunter-gold text-hunter-dark hover:bg-hunter-gold/90 transition-colors font-sans uppercase tracking-[3px] text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? "Se descarcă..." : "Descarcă factura"}
            </button>
            {downloadError && (
              <p className="mt-3 text-sm text-red-500">{downloadError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
