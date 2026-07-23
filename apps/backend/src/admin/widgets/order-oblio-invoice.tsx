import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { Container, Button, Text, Badge, toast } from "@medusajs/ui"
import { useState } from "react"
import { sdk } from "../lib/client"

type OblioInvoiceResponse = {
  invoice_series: string
  invoice_number: string
  display_id?: number
  pdf_base64?: string
}

const OrderOblioInvoiceWidget = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  const [downloading, setDownloading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [invoiceMeta, setInvoiceMeta] = useState({
    series: order.metadata?.oblio_invoice_series as string | undefined,
    number: order.metadata?.oblio_invoice_number as string | undefined,
  })

  const hasInvoice = !!invoiceMeta.series && !!invoiceMeta.number

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const result = await sdk.client.fetch<OblioInvoiceResponse>(
        `/admin/oblio/${order.id}`
      )

      const byteArray = Uint8Array.from(atob(result.pdf_base64!), (c) =>
        c.charCodeAt(0)
      )
      const blob = new Blob([byteArray], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `factura-${result.invoice_series}-${result.invoice_number}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      const message =
        err?.message?.includes("nu a fost generată")
          ? "Factura nu a fost încă generată pentru această comandă."
          : "Eroare la descărcarea facturii Oblio."
      toast.error(message)
    } finally {
      setDownloading(false)
    }
  }

  // Recovers orders where the order.placed subscriber's invoice generation
  // failed silently (transient Oblio outage, misconfigured env var at the
  // time) — previously the only way to fix these was a direct DB edit.
  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const result = await sdk.client.fetch<OblioInvoiceResponse>(
        `/admin/oblio/${order.id}`,
        { method: "POST" }
      )
      setInvoiceMeta({ series: result.invoice_series, number: result.invoice_number })
      toast.success(`Factură generată: ${result.invoice_series}/${result.invoice_number}`)
    } catch (err: any) {
      toast.error(err?.message ?? "Generarea facturii a eșuat.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Text size="small" weight="plus">
            Factură Oblio
          </Text>
          {process.env.NODE_ENV === "development" && (
            <Badge size="2xsmall" color="orange">
              DRY RUN
            </Badge>
          )}
        </div>
        {hasInvoice ? (
          <Button
            size="small"
            variant="secondary"
            onClick={handleDownload}
            isLoading={downloading}
          >
            ↓ Descarcă PDF
          </Button>
        ) : (
          <Button
            size="small"
            variant="secondary"
            onClick={handleGenerate}
            isLoading={generating}
          >
            Generează factura
          </Button>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default OrderOblioInvoiceWidget
