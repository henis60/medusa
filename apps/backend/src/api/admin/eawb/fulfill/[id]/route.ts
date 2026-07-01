import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createOrderFulfillmentWorkflow,
  createOrderShipmentWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * One-click "ready to ship": fulfills every still-unfulfilled item on the order
 * in a single fulfillment, using the order's shipping method (eAWB) — which is
 * what triggers AWB creation. Mirrors the admin fulfillment flow without the
 * manual item-by-item screen.
 *
 * POST /admin/eawb/fulfill/:id
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [order] } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "items.id",
      "items.detail.quantity",
      "items.detail.fulfilled_quantity",
    ],
    filters: { id },
  })

  if (!order) {
    return res.status(404).json({ error: "Comanda nu a fost găsită." })
  }

  const items = (order.items ?? [])
    .map((i: any) => ({
      id: i.id,
      quantity: (i.detail?.quantity ?? 0) - (i.detail?.fulfilled_quantity ?? 0),
    }))
    .filter((i: { quantity: number }) => i.quantity > 0)

  if (!items.length) {
    return res
      .status(400)
      .json({ error: "Toate produsele sunt deja pregătite de expediere." })
  }

  const { result: fulfillment } = await createOrderFulfillmentWorkflow(
    req.scope
  ).run({
    input: {
      order_id: id,
      items,
      additional_data: {},
    },
  })

  // Mark the fulfillment as shipped right away — the AWB is generated and the
  // parcel is handed to the courier, so the order is effectively shipped. This
  // fires `order.shipment_created`, which sends the shipped email.
  await createOrderShipmentWorkflow(req.scope).run({
    input: {
      order_id: id,
      fulfillment_id: (fulfillment as { id: string }).id,
      items,
      additional_data: {},
    },
  })

  return res.json({ ok: true, fulfilled_items: items.length })
}
