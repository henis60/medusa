import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { generateTestInvoicePdf } from "../../lib/generate-test-invoice-pdf"

type Input = {
  order_id: string
  token: string
  series: string
  number: string
}

export const oblioDownloadPdfStep = createStep(
  "oblio-download-pdf",
  async ({ order_id, token, series, number }: Input, { container }) => {
    const logger = container.resolve("logger")

    if (process.env.OBLIO_DRY_RUN === "true") {
      logger.info(`Oblio DRY_RUN: generare PDF de test pentru comanda ${order_id}`)

      const query = container.resolve("query")
      const { data: orders } = await query.graph({
        entity: "order",
        fields: [
          "id",
          "display_id",
          "email",
          "currency_code",
          "shipping_total",
          "customer.first_name",
          "customer.last_name",
          "billing_address.first_name",
          "billing_address.last_name",
          "billing_address.company",
          "billing_address.address_1",
          "billing_address.city",
          "billing_address.province",
          "billing_address.country_code",
          "items.title",
          "items.quantity",
          "items.detail.quantity",
          "items.unit_price",
        ],
        filters: { id: order_id },
      })

      const order = orders?.[0] ?? {}
      const pdfBuffer = await generateTestInvoicePdf(order, series, number)
      return new StepResponse(pdfBuffer.toString("base64"))
    }

    const cui = process.env.OBLIO_CUI ?? ""
    const url = new URL("https://www.oblio.eu/business/api/docs/download")
    url.searchParams.set("cif", cui)
    url.searchParams.set("type", "pdf")
    url.searchParams.set("seriesName", series)
    url.searchParams.set("number", number)

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error(`Oblio download PDF eșuat: ${response.status}`)
    }

    const buffer = await response.arrayBuffer()
    return new StepResponse(Buffer.from(buffer).toString("base64"))
  }
)
