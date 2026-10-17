import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createOrderFulfillmentWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Pasul 1 din 3: „Creează AWB".
 *
 * Face fulfill pe toate produsele încă nepregătite ale comenzii, într-o singură
 * expediere, cu metoda de livrare eAWB — ceea ce generează AWB-ul la Europarcel.
 * Fulfillment-ul rămâne NEEXPEDIAT:
 *
 *   1. Creează AWB   → această rută
 *   2. Expediat      → POST /admin/eawb/ship/:id   (trimite emailul clientului)
 *   3. Anulează      → POST /admin/eawb/cancel/:id (doar cât e neexpediat)
 *
 * Expedierea NU se mai face aici: odată marcat expediat, Medusa nu mai permite
 * anularea fulfillment-ului, iar emailul „expediat" pleca la generarea AWB-ului,
 * adică înainte ca vreun colet să fi plecat.
 *
 * POST /admin/eawb/fulfill/:id        (id = comanda)
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

  const fulfillmentData = (fulfillment as { data?: Record<string, unknown> }).data ?? {}

  // The provider persists the Europarcel order id even when no AWB came back,
  // so the wallet charge stays recoverable. Without an AWB there is nothing
  // to hand to the courier, so tell the operator instead of reporting success.
  if (fulfillmentData.awb_missing) {
    return res.status(502).json({
      error:
        "eAWB: comanda a fost creată la Europarcel, dar fără AWB. Verifică statusul comenzii înainte de a marca expedierea.",
      fulfillment_id: (fulfillment as { id: string }).id,
      europarcel_id: fulfillmentData.europarcel_id,
    })
  }

  return res.json({
    ok: true,
    fulfilled_items: items.length,
    fulfillment_id: (fulfillment as { id: string }).id,
  })
}
