import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const isEawb = (pid?: string | null) =>
  !!pid && (pid.startsWith("eawb_") || pid.startsWith("fp_eawb_"))

/**
 * Everything the order-page eAWB widget needs, computed server-side so it
 * doesn't depend on the admin order endpoint's default field set.
 *
 * GET /admin/eawb/order-status/:id
 * → { uses_eawb, remaining_items, fulfillments: [{ id, data, canceled_at }] }
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [order] } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "items.detail.quantity",
      "items.detail.fulfilled_quantity",
      "shipping_methods.shipping_option_id",
      "fulfillments.id",
      "fulfillments.provider_id",
      "fulfillments.canceled_at",
      "fulfillments.data",
    ],
    filters: { id },
  })

  if (!order) {
    return res.status(404).json({ error: "Comanda nu a fost găsită." })
  }

  // Query graph can't traverse shipping_method → shipping_option's provider, so
  // resolve the options' providers via the fulfillment module instead.
  const optionIds = (order.shipping_methods ?? [])
    .map((sm: any) => sm.shipping_option_id)
    .filter(Boolean)

  let shippingUsesEawb = false
  if (optionIds.length) {
    const fulfillmentModule = req.scope.resolve(Modules.FULFILLMENT)
    const options = await fulfillmentModule.listShippingOptions(
      { id: optionIds },
      { select: ["id", "provider_id"] }
    )
    shippingUsesEawb = options.some((o: any) => isEawb(o.provider_id))
  }

  const usesEawb =
    shippingUsesEawb ||
    (order.fulfillments ?? []).some((f: any) => isEawb(f?.provider_id))

  const remainingItems = (order.items ?? []).reduce(
    (sum: number, i: any) =>
      sum +
      Math.max((i.detail?.quantity ?? 0) - (i.detail?.fulfilled_quantity ?? 0), 0),
    0
  )

  const fulfillments = (order.fulfillments ?? [])
    .filter((f: any) => isEawb(f?.provider_id) && !f?.canceled_at)
    .map((f: any) => ({ id: f.id, data: f.data, canceled_at: f.canceled_at }))

  return res.json({
    uses_eawb: usesEawb,
    remaining_items: remainingItems,
    fulfillments,
  })
}
