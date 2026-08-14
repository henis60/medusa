import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
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

export type OblioInvoiceResult = {
  series: string
  number: string
  pdf_base64: string
}

/**
 * Runs the invoice workflow with a per-order lock held for its whole duration.
 *
 * The workflow's own idempotency check reads `order.metadata.oblio_invoice_number`
 * in its first step but only writes it in its last, so two runs that overlap
 * inside that window both read "no invoice yet" and both bill: `order.placed`
 * delivered twice in parallel, or an admin double-clicking before the first
 * POST returns. Serialising on the order id closes that window — the second
 * caller starts only after the first has recorded the number, so its check
 * sees the existing invoice and returns it instead of creating another.
 *
 * This matters more than a typical duplicate-write race because Oblio invoices
 * are fiscal documents: undoing one means issuing a storno, not a delete.
 *
 * Every call site must go through here rather than running the workflow
 * directly, otherwise the unlocked path reintroduces the race.
 */
export async function runCreateOblioInvoice(
  container: MedusaContainer,
  orderId: string
): Promise<OblioInvoiceResult> {
  const run = async () => {
    const { result } = await createOblioInvoiceWorkflow(container).run({
      input: { order_id: orderId },
    })
    return result as OblioInvoiceResult
  }

  let locking: {
    execute: <T>(
      keys: string | string[],
      job: () => Promise<T>,
      args?: { timeout?: number; provider?: string }
    ) => Promise<T>
  }

  try {
    locking = container.resolve(Modules.LOCKING)
  } catch {
    // Defensive only: Medusa registers the Locking Module by default with an
    // in-memory provider, and medusa-config.ts's REDIS_URL block merely swaps
    // that provider for the Redis one. So this should never be reached. It
    // stays because losing invoicing entirely would be a worse failure than
    // running without the lock — but note the in-memory provider only
    // serialises within a single process, so cross-instance protection depends
    // on REDIS_URL being set in production.
    return run()
  }

  return locking.execute(`oblio-invoice:${orderId}`, run, {
    // The Redis provider uses this single value for BOTH how long a waiter
    // blocks AND the lock key's TTL, and it never renews mid-job. So it has to
    // comfortably exceed the worst case for three sequential Oblio calls
    // (token, create, PDF): if the key expired first, a waiter would acquire
    // and create a second invoice — the exact outcome this prevents. The
    // default of 5 seconds is far too short for that.
    //
    // The cost of erring high is only that a crashed holder blocks the next
    // caller for this long; the cost of erring low is a duplicate fiscal
    // document, so it is deliberately generous.
    timeout: 120,
  })
}
