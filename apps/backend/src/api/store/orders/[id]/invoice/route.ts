import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MedusaError } from "@medusajs/framework/utils"
import { generateTestInvoicePdf } from "../../../../../lib/generate-test-invoice-pdf"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const customerId = req.auth_context.actor_id
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id", "customer_id", "display_id", "metadata",
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

  if (order.customer_id !== customerId) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Acces interzis")
  }

  const invoiceSeries = order.metadata?.oblio_invoice_series as string | undefined
  const invoiceNumber = order.metadata?.oblio_invoice_number as string | undefined

  if (!invoiceSeries || !invoiceNumber) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Factura nu a fost încă generată pentru această comandă"
    )
  }

  let pdfBuffer: Buffer

  if (process.env.OBLIO_DRY_RUN === "true") {
    pdfBuffer = await generateTestInvoicePdf(order, invoiceSeries, invoiceNumber)
  } else {
    // Obține token Oblio
    const tokenResponse = await fetch("https://www.oblio.eu/business/api/authorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.OBLIO_CLIENT_ID,
        client_secret: process.env.OBLIO_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    })

    if (!tokenResponse.ok) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Eroare la autentificarea cu Oblio"
      )
    }

    const { access_token } = await tokenResponse.json()
    const cui = process.env.OBLIO_CUI ?? ""

    const url = new URL("https://www.oblio.eu/business/api/docs/download")
    url.searchParams.set("cif", cui)
    url.searchParams.set("type", "pdf")
    url.searchParams.set("seriesName", invoiceSeries)
    url.searchParams.set("number", invoiceNumber)

    const pdfResponse = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!pdfResponse.ok) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Eroare la descărcarea facturii din Oblio"
      )
    }

    pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer())
  }

  const filename = `factura-${order.display_id ?? id}.pdf`

  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
  res.setHeader("Content-Length", pdfBuffer.length)
  res.end(pdfBuffer)
}
