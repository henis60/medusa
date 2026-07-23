import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { oblioGetTokenStep } from "./steps/oblio-get-token"
import { oblioCreateInvoiceStep } from "./steps/oblio-create-invoice"
import { oblioDownloadPdfStep } from "./steps/oblio-download-pdf"
import { saveOrderInvoiceMetadataStep } from "./steps/save-order-invoice-metadata"

type Input = {
  order_id: string
}

export const createOblioInvoiceWorkflow = createWorkflow(
  "create-oblio-invoice",
  function (input: Input) {
    const token = oblioGetTokenStep()

    const invoice = oblioCreateInvoiceStep(
      transform({ input, token }, ({ input, token }) => ({
        order_id: input.order_id,
        token,
      }))
    )

    const pdfBase64 = oblioDownloadPdfStep(
      transform({ input, invoice, token }, ({ input, invoice, token }) => ({
        order_id: input.order_id,
        token,
        series: invoice.series,
        number: invoice.number,
      }))
    )

    saveOrderInvoiceMetadataStep(
      transform({ input, invoice }, ({ input, invoice }) => ({
        order_id: input.order_id,
        series: invoice.series,
        number: invoice.number,
      }))
    )

    return new WorkflowResponse(
      transform({ invoice, pdfBase64 }, ({ invoice, pdfBase64 }) => ({
        series: invoice.series,
        number: invoice.number,
        pdf_base64: pdfBase64,
      }))
    )
  }
)
