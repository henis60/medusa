import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PlatiOnlineClient } from "../../../../modules/plati-online/lib/client"
import { loadPlatiOnlineOptionsFromEnv } from "../../../../modules/plati-online/lib/config"

/**
 * TEMPORARY diagnostic route (public, openable in a browser): runs a PlatiOnline
 * status query for an order number (= Medusa session id) or transaction id and
 * returns the raw response. Remove before production.
 *
 * GET /hooks/plati-online/debug?session_id=payses_...   (or ?x_trans_id=...)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderNumber = req.query.session_id as string | undefined
  const transactionId = req.query.x_trans_id as string | undefined

  if (!orderNumber && !transactionId) {
    return res.status(400).json({ message: "session_id or x_trans_id required" })
  }

  const options = loadPlatiOnlineOptionsFromEnv()
  const client = new PlatiOnlineClient(options)

  try {
    const result = await client.query({
      orderNumber,
      transactionId,
      testMode: !!options.testMode,
    })
    return res.json({
      ok: true,
      statusFin1: result.statusFin1,
      statusFin2: result.statusFin2,
      transactionId: result.transactionId,
      orderNumber: result.orderNumber,
      amount: result.amount,
      currency: result.currency,
      raw: result.raw.slice(0, 1500),
    })
  } catch (e) {
    return res.json({ ok: false, error: (e as Error).message })
  }
}
