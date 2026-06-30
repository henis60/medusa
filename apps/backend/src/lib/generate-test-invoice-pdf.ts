import PDFDocument from "pdfkit"

export function generateTestInvoicePdf(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any,
  series: string,
  invoiceNumber: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" })
    const chunks: Buffer[] = []
    doc.on("data", (chunk: Buffer) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    const currency = (order.currency_code ?? "RON").toUpperCase()
    const today = new Date().toISOString().split("T")[0]
    const vatPct = parseInt(process.env.OBLIO_VAT_PERCENTAGE ?? "19", 10)
    const companyName = process.env.OBLIO_COMPANY_NAME ?? "Firma SRL"
    const companyCui = process.env.OBLIO_CUI ?? "RO12345678"
    const docType = process.env.OBLIO_DOCUMENT_TYPE ?? "Factura"

    const billing = (order.billing_address ?? {}) as NonNullable<OrderData["billing_address"]>
    const clientName =
      billing.company ||
      `${billing.first_name ?? order.customer?.first_name ?? ""} ${billing.last_name ?? order.customer?.last_name ?? ""}`.trim() ||
      order.email ||
      "Client"

    // ── Antet stânga (emitent) ───────────────────────────────────────────
    doc.fontSize(16).font("Helvetica-Bold").text(companyName, 50, 50)
    doc.fontSize(9).font("Helvetica").fillColor("#555555")
    doc.text(`CIF: ${companyCui}`, 50, 72)

    // ── Antet dreapta (număr factură) ────────────────────────────────────
    doc.fontSize(20).font("Helvetica-Bold").fillColor("#1a1a1a")
    doc.text(docType.toUpperCase(), 350, 50, { align: "right", width: 195 })
    doc.fontSize(11).font("Helvetica").fillColor("#333333")
    doc.text(`${series} / ${invoiceNumber}`, 350, 76, { align: "right", width: 195 })
    doc.fontSize(9).fillColor("#555555")
    doc.text(`Data: ${today}`, 350, 92, { align: "right", width: 195 })
    doc.text(`Scadenta: ${today}`, 350, 106, { align: "right", width: 195 })

    // ── Linie separator ──────────────────────────────────────────────────
    doc.moveTo(50, 130).lineTo(545, 130).strokeColor("#cccccc").lineWidth(1).stroke()

    // ── Cumpărător ───────────────────────────────────────────────────────
    doc.fontSize(8).font("Helvetica-Bold").fillColor("#888888")
    doc.text("CUMPARATOR", 50, 145)
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#1a1a1a")
    doc.text(clientName, 50, 158)
    doc.fontSize(9).font("Helvetica").fillColor("#444444")

    let clientY = 174
    if (billing.address_1) {
      doc.text(billing.address_1, 50, clientY)
      clientY += 14
    }
    if (billing.city || billing.province) {
      doc.text([billing.city, billing.province].filter(Boolean).join(", "), 50, clientY)
      clientY += 14
    }
    if (order.email) {
      doc.text(order.email, 50, clientY)
      clientY += 14
    }

    // ── Referință comandă ────────────────────────────────────────────────
    doc.fontSize(8).fillColor("#888888")
    doc.text(`Referinta comanda: #${order.display_id ?? "—"}`, 50, clientY + 4)

    // ── Tabel produse ────────────────────────────────────────────────────
    const tableTop = Math.max(clientY + 28, 250)
    const C = { nr: 50, produs: 75, cant: 340, pret: 385, total: 480 }

    // Header tabel
    doc.rect(50, tableTop, 495, 20).fillColor("#f0f0f0").fill()
    doc.fontSize(8).font("Helvetica-Bold").fillColor("#333333")
    doc.text("Nr", C.nr, tableTop + 6)
    doc.text("Produs / Serviciu", C.produs, tableTop + 6)
    doc.text("Cant.", C.cant, tableTop + 6, { width: 40, align: "right" })
    doc.text("Pret/buc", C.pret, tableTop + 6, { width: 90, align: "right" })
    doc.text("Total", C.total, tableTop + 6, { width: 65, align: "right" })

    doc.font("Helvetica").fillColor("#1a1a1a")

    const items = order.items ?? []
    let rowY = tableTop + 24
    let lineTotal = 0

    items.forEach((item, i) => {
      const itemTotal = Number(item.unit_price) * Number(item.quantity)
      lineTotal += itemTotal

      if (i % 2 === 1) {
        doc.rect(50, rowY - 4, 495, 18).fillColor("#fafafa").fill()
      }
      doc.fillColor("#1a1a1a").fontSize(8)
      doc.text(String(i + 1), C.nr, rowY)
      doc.text(item.title, C.produs, rowY, { width: 260 })
      doc.text(String(item.quantity), C.cant, rowY, { width: 40, align: "right" })
      doc.text(`${Number(item.unit_price).toFixed(2)} ${currency}`, C.pret, rowY, { width: 90, align: "right" })
      doc.text(`${itemTotal.toFixed(2)} ${currency}`, C.total, rowY, { width: 65, align: "right" })
      rowY += 18
    })

    const shippingTotal = Number(order.shipping_total ?? 0)
    if (shippingTotal > 0) {
      lineTotal += shippingTotal
      const i = items.length
      if (i % 2 === 1) {
        doc.rect(50, rowY - 4, 495, 18).fillColor("#fafafa").fill()
      }
      doc.fillColor("#1a1a1a").fontSize(8)
      doc.text(String(i + 1), C.nr, rowY)
      doc.text("Transport", C.produs, rowY)
      doc.text("1", C.cant, rowY, { width: 40, align: "right" })
      doc.text(`${shippingTotal.toFixed(2)} ${currency}`, C.pret, rowY, { width: 90, align: "right" })
      doc.text(`${shippingTotal.toFixed(2)} ${currency}`, C.total, rowY, { width: 65, align: "right" })
      rowY += 18
    }

    // Linie sub tabel
    doc.moveTo(50, rowY + 4).lineTo(545, rowY + 4).strokeColor("#cccccc").lineWidth(0.5).stroke()

    // ── Totaluri ─────────────────────────────────────────────────────────
    const totalFaraTva = lineTotal / (1 + vatPct / 100)
    const tvaAmount = lineTotal - totalFaraTva

    let totY = rowY + 16
    doc.fontSize(8).fillColor("#444444")
    doc.text("Total fara TVA:", 350, totY, { width: 120, align: "right" })
    doc.text(`${totalFaraTva.toFixed(2)} ${currency}`, C.total, totY, { width: 65, align: "right" })
    totY += 14
    doc.text(`TVA ${vatPct}%:`, 350, totY, { width: 120, align: "right" })
    doc.text(`${tvaAmount.toFixed(2)} ${currency}`, C.total, totY, { width: 65, align: "right" })
    totY += 6
    doc.moveTo(350, totY).lineTo(545, totY).strokeColor("#aaaaaa").lineWidth(0.5).stroke()
    totY += 8
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#1a1a1a")
    doc.text("TOTAL:", 350, totY, { width: 120, align: "right" })
    doc.text(`${lineTotal.toFixed(2)} ${currency}`, C.total, totY, { width: 65, align: "right" })

    // ── Footer DRY RUN ───────────────────────────────────────────────────
    doc.fontSize(7).font("Helvetica").fillColor("#aaaaaa")
    doc.text(
      "Document generat in modul DRY RUN — nu are valoare fiscala",
      50, 780, { align: "center", width: 495 }
    )

    doc.end()
  })
}
