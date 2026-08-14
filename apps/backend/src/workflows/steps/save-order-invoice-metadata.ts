import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

type Input = {
  order_id: string
  series: string
  number: string
}

export const saveOrderInvoiceMetadataStep = createStep(
  "save-order-invoice-metadata",
  async ({ order_id, series, number }: Input, { container }) => {
    const orderModule = container.resolve(Modules.ORDER)

    // `updateOrders` replaces the metadata column wholesale, so writing only the
    // Oblio keys would drop everything else stored there (Netopia payment refs,
    // eAWB tracking, …). Read-then-merge keeps those intact.
    const existing = await orderModule.retrieveOrder(order_id, {
      select: ["id", "metadata"],
    })

    await orderModule.updateOrders([{
      id: order_id,
      metadata: {
        ...(existing?.metadata ?? {}),
        oblio_invoice_series: series,
        oblio_invoice_number: number,
      },
    }])

    return new StepResponse({ order_id, series, number })
  }
)
