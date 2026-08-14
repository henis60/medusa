import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { generateTestInvoicePdf } from "../../../../lib/generate-test-invoice-pdf"
import { runCreateOblioInvoice } from "../../../../workflows/create-oblio-invoice"

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

// Manual retry for orders where the automatic order.placed subscriber never
// produced an invoice (a transient Oblio outage, a missing/misconfigured env
// var at the time, etc.) — there was previously no way to recover these
// short of a direct DB edit. The workflow is idempotent (oblio-create-invoice
// returns the existing series/number if metadata is already set), so this is
// safe to call even if an invoice does exist.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  try {
    const result = await runCreateOblioInvoice(req.scope, id)

    return res.json({
      invoice_series: result.series,
      invoice_number: result.number,
    })
  } catch (error) {
    // Invoice creation is serialised per order. If another run (the order.placed
    // subscriber, or an impatient second click) still holds the lock when the
    // wait budget runs out, say so plainly — a bare 500 reads as "invoicing is
    // broken" when the right action is simply to reload and check.
    const message = String((error as Error)?.message ?? error)
    if (/lock/i.test(message)) {
      return res.status(409).json({
        message:
          "Se generează deja o factură pentru această comandă. " +
          "Reîncarcă pagina în câteva momente.",
      })
    }
    throw error
  }
}
