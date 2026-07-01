"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import Help from "@modules/order/components/help"
import React, { useState } from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
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
        setDownloadError(err.message ?? "Factura nu este disponibilă încă.")
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
    <div className="w-full">
      {/* Header */}
      <div className="small:px-8 pt-8 pb-6 border-b border-[var(--theme-border)]">
        <LocalizedClientLink
          href="/account/orders"
          className="hidden small:inline-block font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-current pb-0.5 mb-6"
          data-testid="back-to-overview-button"
        >
          ← Înapoi la comenzi
        </LocalizedClientLink>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-[28px] small:text-[32px] leading-[1] text-[var(--theme-text)]">
            Comanda #{order.display_id}
          </h1>
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-current pb-0.5 mt-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? "Se descarcă..." : "Descarcă factura"}
          </button>
        </div>
        {downloadError && (
          <p className="mt-2 text-sm text-red-500">{downloadError}</p>
        )}
      </div>

      <div
        className="flex flex-col divide-y divide-[var(--theme-border)]"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />
        <Items order={order} />
        <ShippingDetails order={order} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
