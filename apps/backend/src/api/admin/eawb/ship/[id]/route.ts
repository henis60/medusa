import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createOrderShipmentWorkflow } from "@medusajs/medusa/core-flows"

const isEawb = (pid?: string | null) =>
  !!pid && (pid.startsWith("eawb_") || pid.startsWith("fp_eawb_"))

/**
 * Pasul 2 din 3: „Expediat".
 *
 * Marchează ca expediat un fulfillment deja creat (cu AWB). Se apasă când
 * coletul chiar pleacă la curier. Emite `shipment.created`, ceea ce trimite
 * emailul „comanda ta a fost expediată", cu AWB și link de urmărire — vezi
 * subscribers/order-shipment-created.ts.
 *
 * După acest pas Medusa nu mai permite anularea fulfillment-ului.
 *
 * POST /admin/eawb/ship/:id        (id = fulfillment id)
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [fulfillment] } = await query.graph({
    entity: "fulfillment",
    fields: [
      "id",
      "provider_id",
      "canceled_at",
      "shipped_at",
      "items.line_item_id",
      "items.quantity",
    ],
    filters: { id },
  })

  if (!fulfillment) {
    return res.status(404).json({ error: "Expedierea nu a fost găsită." })
  }
  if (!isEawb(fulfillment.provider_id)) {
    return res.status(400).json({ error: "Expedierea nu e eAWB / Europarcel." })
  }
  if (fulfillment.canceled_at) {
    return res.status(409).json({ error: "Expedierea e anulată." })
  }
  if (fulfillment.shipped_at) {
    return res.status(409).json({ error: "Expedierea e deja marcată ca expediată." })
  }

  const { data: links } = await query.graph({
    entity: "order_fulfillment",
    fields: ["order_id"],
    filters: { fulfillment_id: id },
  })
  const orderId = links?.[0]?.order_id as string | undefined
  if (!orderId) {
    return res.status(404).json({ error: "Nu am găsit comanda expedierii." })
  }

  const items = ((fulfillment as any).items ?? [])
    .filter((i: any) => i?.line_item_id && i?.quantity > 0)
    .map((i: any) => ({ id: i.line_item_id as string, quantity: i.quantity as number }))

  if (!items.length) {
    return res
      .status(400)
      .json({ error: "Expedierea nu are produse asociate — nu pot marca expedierea." })
  }

  try {
    await createOrderShipmentWorkflow(req.scope).run({
      input: {
        order_id: orderId,
        fulfillment_id: id,
        items,
        additional_data: {},
      },
    })
  } catch (err) {
    logger.error(
      `eAWB ship: fulfillment ${id} (comanda ${orderId}) — ${(err as Error).message}`
    )
    return res.status(502).json({ error: `Marcarea ca expediat a eșuat: ${(err as Error).message}` })
  }

  logger.info(`eAWB ship: fulfillment ${id} marcat expediat (comanda ${orderId})`)
  return res.json({ ok: true })
}
