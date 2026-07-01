import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Button, Text, Badge, toast } from "@medusajs/ui"
import { useState } from "react"
import { sdk } from "../lib/client"

type OblioInvoiceResponse = {
  invoice_series: string
  invoice_number: string
  display_id: number
  pdf_base64: string
}

const OrderOblioInvoiceWidget = ({ data: order }: { data: { id: string } }) => {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const result = await sdk.client.fetch<OblioInvoiceResponse>(
        `/admin/oblio/${order.id}`
      )

      const byteArray = Uint8Array.from(atob(result.pdf_base64), (c) =>
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
        <Button
          size="small"
          variant="secondary"
          onClick={handleDownload}
          isLoading={downloading}
        >
          ↓ Descarcă PDF
        </Button>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default OrderOblioInvoiceWidget
