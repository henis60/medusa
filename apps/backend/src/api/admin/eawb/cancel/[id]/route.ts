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
  const fulfillmentModule = req.scope.resolve(Modules.FULFILLMENT) as any

  // Operatorul confirmă că AWB-ul e deja anulat în contul Europarcel: nu mai
  // încercăm să-l anulăm la curier, ci doar în Medusa.
  const alreadyCanceled = req.query.already_canceled === "true"

  const fail = (status: number, error: string) =>
    // `message` pe lângă `error`: SDK-ul admin citește `message`, iar fără el
    // operatorul vedea un text generic în loc de motivul real.
    res.status(status).json({ error, message: error })

  const { data: [fulfillment] } = await query.graph({
    entity: "fulfillment",
    fields: ["id", "provider_id", "canceled_at", "shipped_at", "delivered_at", "data"],
    filters: { id },
  })

  if (!fulfillment) {
    return fail(404, "Expedierea nu a fost găsită.")
  }
  if (!isEawb(fulfillment.provider_id)) {
    return fail(400, "Expedierea nu e eAWB / Europarcel.")
  }
  if (fulfillment.canceled_at) {
    return res.json({ ok: true, mode: "already_canceled" })
  }

  const originalData = (fulfillment.data ?? {}) as Record<string, unknown>

  // Steagul pe care providerul îl citește ca să nu mai lovească Europarcel.
  // Se setează doar la cererea explicită a operatorului și se CURĂȚĂ dacă
  // anularea eșuează: rămas pe fulfillment, ar face o încercare viitoare să
  // sară în tăcere peste curier.
  const markSkip = () =>
    alreadyCanceled
      ? fulfillmentModule.updateFulfillment(id, {
          data: { ...originalData, courier_cancel_skipped: true },
        })
      : Promise.resolve()
  const clearSkip = () =>
    alreadyCanceled
      ? fulfillmentModule
          .updateFulfillment(id, { data: originalData })
          .catch((e: Error) =>
            logger.error(
              `eAWB cancel: NU am putut șterge courier_cancel_skipped de pe ${id} — ${e.message}`
            )
          )
      : Promise.resolve()

  // ── Neexpediat: unfulfill complet ───────────────────────────────────────────
  const deliveredAt = (fulfillment as any).delivered_at as string | null | undefined
  if (!fulfillment.shipped_at && !deliveredAt) {
    const { data: links } = await query.graph({
      entity: "order_fulfillment",
      fields: ["order_id"],
      filters: { fulfillment_id: id },
    })
    const orderId = links?.[0]?.order_id as string | undefined
    if (!orderId) {
      return fail(404, "Nu am găsit comanda expedierii.")
    }

    await markSkip()
    try {
      await cancelOrderFulfillmentWorkflow(req.scope).run({
        input: { order_id: orderId, fulfillment_id: id },
      })
    } catch (err) {
      await clearSkip()
      logger.error(
        `eAWB cancel: fulfillment ${id} (comanda ${orderId}) — ${(err as Error).message}`
      )
      return fail(502, `Anularea a eșuat: ${(err as Error).message}`)
    }

    logger.info(
      `eAWB cancel: fulfillment ${id} anulat prin Medusa (comanda ${orderId})` +
        (alreadyCanceled ? " — fără apel la curier (confirmat de operator)" : "")
    )
    return res.json({ ok: true, mode: "fulfillment_canceled" })
  }

  // ── Expediat sau livrat: scoatem `shipped_at` și `delivered_at`, apoi anulăm
  //    prin modulul de fulfillment. Modulul refuză și un fulfillment livrat
  //    („already delivered"), deci ambele marcaje trebuie scoase. ─────────────
  const originalShippedAt = fulfillment.shipped_at
    ? new Date(fulfillment.shipped_at as unknown as string)
    : null
  const originalDeliveredAt = deliveredAt ? new Date(deliveredAt) : null

  await fulfillmentModule.updateFulfillment(id, { shipped_at: null, delivered_at: null })
  await markSkip()

  try {
    // Apelează providerul (AWB anulat la Europarcel) și setează canceled_at.
    await fulfillmentModule.cancelFulfillment(id)
  } catch (err) {
    // Europarcel a refuzat sau altă eroare: readucem `shipped_at` și
    // `delivered_at` (și datele), ca expedierea să nu rămână pe jumătate
    // modificată.
    await clearSkip()
    await fulfillmentModule
      .updateFulfillment(id, {
        shipped_at: originalShippedAt,
        delivered_at: originalDeliveredAt,
      })
      .catch((restoreErr: Error) =>
        logger.error(
          `eAWB cancel: NU am putut restaura shipped_at/delivered_at pe fulfillment ${id} — ${restoreErr.message}`
        )
      )
    logger.error(`eAWB cancel: fulfillment ${id} (expediat) — ${(err as Error).message}`)
    return fail(502, `Anularea a eșuat: ${(err as Error).message}`)
  }

  logger.info(
    `eAWB cancel: fulfillment ${id} ${deliveredAt ? "livrat" : "expediat"} anulat (AWB + canceled_at), comanda poate fi anulată` +
      (alreadyCanceled ? " — fără apel la curier (confirmat de operator)" : "")
  )
  return res.json({ ok: true, mode: "shipped_canceled" })
}
