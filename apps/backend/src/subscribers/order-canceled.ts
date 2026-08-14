import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { cancelOrderFulfillmentWorkflow } from "@medusajs/core-flows"
import { EuroparcelApiError } from "../modules/eawb/lib/errors"

/**
 * Cancelling an order does not cancel the courier shipment.
 *
 * `cancelOrderWorkflow` only *validates* that every fulfillment is already
 * canceled — it never calls the fulfillment provider — so an order cancelled
 * while an AWB was live left a parcel that Europarcel would still collect.
 * This subscriber closes that gap by running the fulfillment-level cancel
 * workflow, which is what actually reaches `cancelFulfillment` on the provider.
 */

// The runtime provider id is `eawb_eawb` (module id + provider id), not the
// `fp_`-prefixed form seen in some Medusa docs — match on the prefix so both
// keep working.
const EAWB_PROVIDER_PREFIX = "eawb_"

export default async function cancelOrderShipments({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "fulfillments.id",
      "fulfillments.provider_id",
      "fulfillments.canceled_at",
      "fulfillments.shipped_at",
    ],
    filters: { id: data.id },
  })

  const order = orders?.[0]
  if (!order) {
    logger.error(`Comanda ${data.id} negăsită, nu se anulează expedierile`)
    return
  }

  const fulfillments: any[] = (order.fulfillments ?? []).filter((f: any) => {
    if (!f) return false
    if (!String(f.provider_id ?? "").startsWith(EAWB_PROVIDER_PREFIX)) return false
    if (f.canceled_at) {
      logger.info(
        `Expedierea ${f.id} (comanda ${order.id}) este deja anulată, se omite`
      )
      return false
    }
    return true
  })

  if (!fulfillments.length) {
    return
  }

  // Collected rather than thrown immediately so one stuck AWB doesn't stop the
  // others on the same order from being cancelled.
  let retryableError: unknown = null

  for (const fulfillment of fulfillments) {
    try {
      await cancelOrderFulfillmentWorkflow(container).run({
        input: { order_id: order.id, fulfillment_id: fulfillment.id },
      })
      logger.info(
        `Expedierea ${fulfillment.id} anulată la curier pentru comanda ${order.id}`
      )
    } catch (err) {
      // Only transient courier/network problems are worth another delivery of
      // the event. A permanent failure (parcel already shipped, payload
      // rejected, bad API key) would retry forever and never succeed, so it is
      // logged for a human instead. `cancelFulfillment` is idempotent, so a
      // retry that partially succeeded before is safe to re-run.
      // The workflow engine can re-wrap a step error, which drops the
      // prototype — fall back to the marker properties the class sets.
      const candidate = err as Partial<EuroparcelApiError> & { name?: string }
      const isEuroparcelError =
        err instanceof EuroparcelApiError || candidate?.name === "EuroparcelApiError"
      const isRetryable = isEuroparcelError && candidate.retryable === true

      logger.error(
        `${isRetryable ? "SHIPMENT CANCEL RETRYABLE" : "SHIPMENT CANCEL FAILED"}: ` +
        `expedierea ${fulfillment.id} (comanda ${order.id}) — ` +
        String((err as Error)?.message ?? err)
      )

      if (isRetryable) {
        retryableError = err
      }
    }
  }

  if (retryableError) {
    throw retryableError
  }
}

export const config: SubscriberConfig = {
  event: "order.canceled",
}
