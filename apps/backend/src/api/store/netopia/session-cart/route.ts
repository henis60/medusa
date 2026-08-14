import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Resolves the cart id (and a coarse payment outcome) from a payment session id.
 * Used by the Netopia return page: the redirectUrl carries ?session_id=ps_xxx
 * so we can find the cart even when the cart cookie is unavailable.
 *
 * Intentionally unauthenticated: guests return from Netopia via a cross-site
 * POST, so no auth header and often no cookie survives the trip. To limit what
 * an id-guessing caller learns, we expose only what the return page consumes
 * (see completeNetopiaBySession in apps/storefront/src/lib/data/cart.ts):
 * the cart id, and a status collapsed to "error" | "canceled" | "pending".
 * Internal lifecycle states (authorized/captured/requires_more) and the
 * payment_collection_id are no longer disclosed.
 */

// Only the two values the storefront branches on are passed through verbatim.
const FAILED_STATUSES = new Set(["error", "canceled"])

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const sessionId = req.query.session_id as string | undefined

  // Shape check only — deliberately NOT prefix-specific.
  //
  // A previous version required `ps_`/`sess_`, which matched nothing: Medusa
  // mints payment session ids with the `payses_` prefix
  // (@medusajs/payment/dist/models/payment-session.js). That rejected every
  // real id, so the return page polled forever and no order was ever
  // confirmed. The prefix is Medusa's to choose and can change — validating it
  // here buys nothing, since the id is passed as a parameterised filter below.
  if (!sessionId || !/^[A-Za-z0-9_-]{1,80}$/.test(sessionId)) {
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

  const rawStatus = session.status as string | undefined

  return res.json({
    cart_id: links?.[0]?.cart_id ?? null,
    status: rawStatus
      ? FAILED_STATUSES.has(rawStatus)
        ? rawStatus
        : "pending"
      : null,
  })
}
