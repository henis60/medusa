import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MedusaError } from "@medusajs/framework/utils"

const TEST_PDF_BASE64 =
  "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPJ4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKL1Jlc291cmNlcyA8PAovRm9udCA8PAovRjEgNSAwIFIKPj4KPj4KPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQKKEZhY3R1cmEgdGVzdCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjY2IDAwMDAwIG4gCjAwMDAwMDAzNjAgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MzUKJSVFT0YK"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const customerId = req.auth_context.actor_id
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "customer_id", "display_id", "metadata"],
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
    pdfBuffer = Buffer.from(TEST_PDF_BASE64, "base64")
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
