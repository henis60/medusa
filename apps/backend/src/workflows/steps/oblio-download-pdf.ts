import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { generateTestInvoicePdf } from "../../lib/generate-test-invoice-pdf"
import { requireOblioCui } from "./oblio-get-token"

type Input = {
  order_id: string
  token: string
  series: string
  number: string
  link?: string
}

/**
 * Plain-function download shared with the admin/store PDF routes, which run
 * outside a workflow and would otherwise duplicate the URL construction.
 */
export async function downloadOblioPdf(
  token: string,
  series: string,
  number: string,
  link?: string
): Promise<Buffer> {
  const cui = requireOblioCui()

  // Calea preferată: link-ul întors de Oblio la emitere. SDK-ul oficial
  // (OblioSoftware/OblioApi) NU expune niciun endpoint de download — expune
  // doar GET /api/docs/invoice pentru citirea documentului — deci URL-ul
  // construit mai jos rămâne o presupunere. Când avem link, îl folosim.
  //
  // De reținut: pe api.oblio.eu un 401 NU dovedește că o cale există; e
  // peretele generic al API-ului. (Așa am „confirmat" greșit /api/authorize.)
  const url = link
    ? new URL(link)
    : new URL("https://www.oblio.eu/api/docs/invoice/download")

  if (!link) {
    url.searchParams.set("cif", cui)
    url.searchParams.set("type", "pdf")
    url.searchParams.set("seriesName", series)
    url.searchParams.set("number", number)
  }

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(
      `Oblio download PDF eșuat: ${response.status} — ${text.slice(0, 300)}`
    )
  }

  const buf = Buffer.from(await response.arrayBuffer())

  // Un PDF gol sau un corp JSON de eroare primit cu 200 ar fi salvat ca
  // „factură" și descoperit abia când clientul deschide fișierul.
  const looksPdf = buf.subarray(0, 5).toString("latin1") === "%PDF-"
  if (!looksPdf) {
    throw new Error(
      `Oblio download PDF: răspuns care nu e PDF (${buf.length} B, început=` +
        `${buf.subarray(0, 60).toString("utf8").replace(/\s+/g, " ")})`
    )
  }

  return buf
}

export const oblioDownloadPdfStep = createStep(
  "oblio-download-pdf",
  async ({ order_id, token, series, number, link }: Input, { container }) => {
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

    logger.info(
      `Oblio → descărcare PDF ${series}/${number} pentru comanda ${order_id} ` +
        `(sursă=${link ? "link din răspuns" : "endpoint construit"})`
    )
    const buffer = await downloadOblioPdf(token, series, number, link)
    logger.info(
      `Oblio ← PDF primit ${series}/${number} (${buffer.length} B) pentru comanda ${order_id}`
    )
    return new StepResponse(buffer.toString("base64"))
  }
)
