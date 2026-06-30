import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { generateTestInvoicePdf } from "../../../../lib/generate-test-invoice-pdf"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id", "display_id", "metadata",
      "email", "currency_code", "shipping_total",
      "customer.first_name", "customer.last_name",
      "billing_address.first_name", "billing_address.last_name",
      "billing_address.company", "billing_address.address_1",
      "billing_address.city", "billing_address.province",
      "billing_address.country_code",
      "items.title", "items.quantity", "items.unit_price",
      "items.detail.quantity",
    ],
    filters: { id },
  })

  const order = orders?.[0]
  if (!order) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Comanda negăsită")
  }

  const invoiceSeries = order.metadata?.oblio_invoice_series as string | undefined
  const invoiceNumber = order.metadata?.oblio_invoice_number as string | undefined

  if (!invoiceSeries || !invoiceNumber) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Factura Oblio nu a fost generată pentru această comandă"
    )
  }

  let pdfBase64: string

  if (process.env.OBLIO_DRY_RUN === "true") {
    const pdfBuffer = await generateTestInvoicePdf(order, invoiceSeries, invoiceNumber)
    pdfBase64 = pdfBuffer.toString("base64")
  } else {
    const tokenRes = await fetch("https://www.oblio.eu/business/api/authorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.OBLIO_CLIENT_ID,
        client_secret: process.env.OBLIO_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    })

    if (!tokenRes.ok) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Eroare la autentificarea cu Oblio"
      )
    }

    const { access_token } = await tokenRes.json()
    const cui = process.env.OBLIO_CUI ?? ""
    const url = new URL("https://www.oblio.eu/business/api/docs/download")
    url.searchParams.set("cif", cui)
    url.searchParams.set("type", "pdf")
    url.searchParams.set("seriesName", invoiceSeries)
    url.searchParams.set("number", invoiceNumber)

    const pdfRes = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!pdfRes.ok) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Eroare la descărcarea PDF-ului din Oblio"
      )
    }

    pdfBase64 = Buffer.from(await pdfRes.arrayBuffer()).toString("base64")
  }

  return res.json({
    invoice_series: invoiceSeries,
    invoice_number: invoiceNumber,
    display_id: order.display_id,
    pdf_base64: pdfBase64,
  })
}
