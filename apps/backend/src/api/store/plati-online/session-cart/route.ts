import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Resolves the cart id (and any existing order) for a payment session id.
 * Used by the PlatiOnline relay return page, which receives `session_id` in the
 * URL because the cross-site POST return doesn't carry the cart cookie.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const sessionId = req.query.session_id as string | undefined
  if (!sessionId) {
    return res.status(400).json({ message: "session_id is required" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: sessions } = await query.graph({
    entity: "payment_session",
    fields: ["payment_collection_id", "status"],
    filters: { id: sessionId },
  })
  const session = sessions?.[0]
  if (!session?.payment_collection_id) {
    return res.json({ cart_id: null, status: null })
  }

  const { data: links } = await query.graph({
    entity: "cart_payment_collection",
    fields: ["cart_id"],
    filters: { payment_collection_id: session.payment_collection_id },
  })

  return res.json({
    cart_id: links?.[0]?.cart_id ?? null,
    // Payment session status reflects the last authorization attempt:
    // "error"/"canceled" → terminal decline; otherwise still settling.
    status: session.status ?? null,
  })
}
