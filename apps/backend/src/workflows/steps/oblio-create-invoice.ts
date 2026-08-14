import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

type Input = {
  order_id: string
  token: string
}

type InvoiceResult = {
  series: string
  number: string
}

export const oblioCreateInvoiceStep = createStep(
  "oblio-create-invoice",
  async ({ order_id, token }: Input, { container }) => {
    const logger = container.resolve("logger")

    if (process.env.OBLIO_DRY_RUN === "true") {
      logger.info(`Oblio DRY_RUN: factură fictivă pentru comanda ${order_id}`)
      return new StepResponse({ series: "TEST", number: "0001" } as InvoiceResult)
    }

    const query = container.resolve("query")
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "currency_code",
        "shipping_total",
        "total",
        "discount_total",
        "metadata",
        "customer.first_name",
        "customer.last_name",
        "billing_address.first_name",
        "billing_address.last_name",
        "billing_address.address_1",
        "billing_address.city",
        "billing_address.province",
        "billing_address.country_code",
        "billing_address.company",
        "billing_address.phone",
        "items.id",
        "items.title",
        "items.quantity",
        "items.unit_price",
        "items.total",
        "items.subtotal",
        "items.discount_total",
      ],
      filters: { id: order_id },
    })

    const order = orders?.[0]
    if (!order) {
      throw new Error(`Comanda ${order_id} negăsită`)
    }

    // Idempotență: dacă factura există deja, returnează datele existente
    if (order.metadata?.oblio_invoice_number) {
      logger.info(
        `Factură existentă pentru comanda ${order_id}: ` +
        `${order.metadata.oblio_invoice_series}/${order.metadata.oblio_invoice_number}`
      )
      return new StepResponse({
        series: order.metadata.oblio_invoice_series as string,
        number: order.metadata.oblio_invoice_number as string,
      } as InvoiceResult)
    }

    const cui = process.env.OBLIO_CUI
    const seriesName = process.env.OBLIO_INVOICE_SERIES ?? "FCT"
    const documentType = process.env.OBLIO_DOCUMENT_TYPE ?? "Factura"
    // Romania's standard VAT rate is 21% (the previous 19% default silently
    // under-declared VAT on every invoice issued without the env var set).
    const vatPercentage = parseInt(process.env.OBLIO_VAT_PERCENTAGE ?? "21", 10)
    const currency = (order.currency_code ?? "RON").toUpperCase()
    const today = new Date().toISOString().split("T")[0]

    const billing = order.billing_address ?? {}
    const clientName =
      (billing as any).company ||
      `${(billing as any).first_name ?? order.customer?.first_name ?? ""} ${(billing as any).last_name ?? order.customer?.last_name ?? ""}`.trim() ||
      order.email

    // Unit price AFTER any promotion applied to the line.
    //
    // `unit_price` is the pre-discount price, so invoicing it directly billed
    // the customer more than they actually paid whenever a promotion was
    // active — a real problem on a fiscal document. `item.total` is the final
    // amount for the line (tax inclusive, matching `vatIncluded: true` below),
    // so dividing it by the quantity gives the effective unit price.
    //
    // The discount is folded into the unit price rather than sent as a separate
    // Oblio discount line: that keeps the invoice total equal to the order
    // total by construction. Itemising it instead would mean relying on Oblio's
    // discount-line semantics, which are not verifiable from here.
    const effectiveUnitPrice = (item: any): number => {
      const quantity = Number(item.quantity ?? 1) || 1

      const lineTotal = Number(item.total)
      if (Number.isFinite(lineTotal)) return lineTotal / quantity

      // Fallback if `total` isn't populated: subtract the line's discount.
      const unitPrice = Number(item.unit_price ?? 0)
      const discountTotal = Number(item.discount_total ?? 0)
      return unitPrice - (Number.isFinite(discountTotal) ? discountTotal : 0) / quantity
    }

    const products = (order.items ?? []).map((item: any) => ({
      name: item.title,
      code: item.id,
      price: effectiveUnitPrice(item),
      measuringUnit: "buc",
      currency,
      vatName: "Normala",
      vatPercentage,
      vatIncluded: true,
      quantity: item.quantity ?? 1,
      productType: "Produs",
      isDiscount: false,
      saveToDb: false,
    }))

    const shippingTotal = Number((order as any).shipping_total ?? 0)
    if (shippingTotal > 0) {
      products.push({
        name: "Transport",
        code: "shipping",
        price: shippingTotal,
        measuringUnit: "buc",
        currency,
        vatName: "Normala",
        vatPercentage,
        vatIncluded: true,
        quantity: 1,
        productType: "Serviciu",
        isDiscount: false,
        saveToDb: false,
      })
    }

    // An invoice that disagrees with what was charged is a fiscal problem that
    // can only be undone with a storno, so check the arithmetic before sending
    // rather than discovering it from a customer complaint. Rounding to two
    // decimals per unit can legitimately drift a bani or two on quantities that
    // don't divide evenly, hence the tolerance.
    const invoiceTotal = products.reduce(
      (sum, product) => sum + product.price * Number(product.quantity ?? 1),
      0
    )
    const orderTotal = Number((order as any).total ?? 0)
    if (Number.isFinite(orderTotal) && orderTotal > 0) {
      const drift = Math.abs(invoiceTotal - orderTotal)
      if (drift > 0.05) {
        logger.warn(
          `Oblio: totalul facturii (${invoiceTotal.toFixed(2)} ${currency}) diferă de ` +
          `totalul comenzii ${order_id} (${orderTotal.toFixed(2)} ${currency}). ` +
          `Verifică reducerile și transportul înainte de a trimite factura clientului.`
        )
      }
    }

    const response = await fetch("https://www.oblio.eu/business/api/docs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cif: cui,
        client: {
          name: clientName,
          address: (billing as any).address_1 ?? "",
          state: (billing as any).province ?? "",
          city: (billing as any).city ?? "",
          country: (billing as any).country_code ?? "RO",
          phone: (billing as any).phone ?? "",
          email: order.email ?? "",
        },
        issueDate: today,
        dueDate: today,
        deliveryDate: today,
        reference: String(order.display_id ?? order_id),
        language: "RO",
        precision: 2,
        currency,
        products,
        type: documentType,
        seriesName,
        useStock: false,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Oblio creare factură eșuată: ${response.status} — ${text}`)
    }

    const data = await response.json()
    const model = data.model ?? data

    return new StepResponse({
      series: model.seriesName ?? seriesName,
      number: String(model.number ?? ""),
    } as InvoiceResult)
  }
)
