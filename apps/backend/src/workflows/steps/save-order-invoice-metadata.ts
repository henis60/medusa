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

    await orderModule.updateOrders([{
      id: order_id,
      metadata: {
        oblio_invoice_series: series,
        oblio_invoice_number: number,
      },
    }])

    return new StepResponse({ order_id, series, number })
  }
)
