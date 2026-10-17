import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { cancelOrderFulfillmentWorkflow } from "@medusajs/medusa/core-flows"

const isEawb = (pid?: string | null) =>
  !!pid && (pid.startsWith("eawb_") || pid.startsWith("fp_eawb_"))

/**
 * Pasul 3: „Anulează".
 *
 * POST /admin/eawb/cancel/:id      (id = fulfillment id)
 *
 *  • NEEXPEDIAT → unfulfill complet prin fluxul Medusa: AWB anulat la
 *    Europarcel, produsele revin în stoc, comanda poate fi anulată sau refăcută.
 *
 *  • EXPEDIAT → anulează AWB-ul și fulfillment-ul, DOAR ca să se poată anula
 *    comanda. Medusa cere ca toate fulfillment-urile să fie anulate înainte de
 *    anularea comenzii, iar un fulfillment expediat nu se poate anula (nici în
 *    workflow, nici în modul: „already shipped"). Soluția: scoatem `shipped_at`,
 *    apoi anulăm prin modulul de fulfillment (care apelează providerul → AWB
 *    anulat la Europarcel, și setează `canceled_at`).
 *
 *    Pe această cale NU rulăm fluxul de comenzi, deci cantitățile din comandă
 *    (`fulfilled_quantity`, `shipped_quantity`) și stocul rămân neatinse.
 *    Fulfillment-ul anulat cu produse încă „expediate" înseamnă o comandă care
 *    NU mai poate fi pregătită sau expediată din nou — de aceea se folosește
 *    doar urmată de anularea comenzii.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [fulfillment] } = await query.graph({
    entity: "fulfillment",
    fields: ["id", "provider_id", "canceled_at", "shipped_at", "delivered_at"],
    filters: { id },
  })

  if (!fulfillment) {
    return res.status(404).json({ error: "Expedierea nu a fost găsită." })
  }
  if (!isEawb(fulfillment.provider_id)) {
    return res.status(400).json({ error: "Expedierea nu e eAWB / Europarcel." })
  }
  if (fulfillment.canceled_at) {
    return res.json({ ok: true, mode: "already_canceled" })
  }
  if ((fulfillment as any).delivered_at) {
    return res.status(409).json({
      error: "Expedierea e marcată ca livrată — nu mai poate fi anulată.",
    })
  }

  // ── Neexpediat: unfulfill complet ───────────────────────────────────────────
  if (!fulfillment.shipped_at) {
    const { data: links } = await query.graph({
      entity: "order_fulfillment",
      fields: ["order_id"],
      filters: { fulfillment_id: id },
    })
    const orderId = links?.[0]?.order_id as string | undefined
    if (!orderId) {
      return res.status(404).json({ error: "Nu am găsit comanda expedierii." })
    }

    try {
      await cancelOrderFulfillmentWorkflow(req.scope).run({
        input: { order_id: orderId, fulfillment_id: id },
      })
    } catch (err) {
      logger.error(
        `eAWB cancel: fulfillment ${id} (comanda ${orderId}) — ${(err as Error).message}`
      )
      return res.status(502).json({ error: `Anularea a eșuat: ${(err as Error).message}` })
    }

    logger.info(`eAWB cancel: fulfillment ${id} anulat prin Medusa (comanda ${orderId})`)
    return res.json({ ok: true, mode: "fulfillment_canceled" })
  }

  // ── Expediat: scoatem `shipped_at`, apoi anulăm prin modulul de fulfillment ─
  const fulfillmentModule = req.scope.resolve(Modules.FULFILLMENT) as any
  const originalShippedAt = new Date(fulfillment.shipped_at as unknown as string)

  await fulfillmentModule.updateFulfillment(id, { shipped_at: null })

  try {
    // Apelează providerul (AWB anulat la Europarcel) și setează canceled_at.
    await fulfillmentModule.cancelFulfillment(id)
  } catch (err) {
    // Europarcel a refuzat sau altă eroare: readucem `shipped_at`, ca expedierea
    // să nu rămână într-o stare pe jumătate modificată.
    await fulfillmentModule
      .updateFulfillment(id, { shipped_at: originalShippedAt })
      .catch((restoreErr: Error) =>
        logger.error(
          `eAWB cancel: NU am putut restaura shipped_at pe fulfillment ${id} — ${restoreErr.message}`
        )
      )
    logger.error(`eAWB cancel: fulfillment ${id} (expediat) — ${(err as Error).message}`)
    return res.status(502).json({ error: `Anularea a eșuat: ${(err as Error).message}` })
  }

  logger.info(
    `eAWB cancel: fulfillment ${id} expediat anulat (AWB + canceled_at), comanda poate fi anulată`
  )
  return res.json({ ok: true, mode: "shipped_canceled" })
}
