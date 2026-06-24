import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, PaymentWebhookEvents } from "@medusajs/framework/utils"

import { decryptItsnIds } from "../../../modules/plati-online/lib/itsn"
import { buildItsnResponse } from "../../../modules/plati-online/lib/xml"
import { loadPlatiOnlineOptionsFromEnv } from "../../../modules/plati-online/lib/config"

// Registered as pp_{identifier}_{id}; override via env if the config id differs.
const PROVIDER_ID = process.env.PO_PROVIDER_ID || "pp_plati-online_plati-online"

/**
 * ITSN (Instant Transaction Notification Status) endpoint.
 *
 * PlatiOnline POSTs an encrypted notification here whenever a transaction's
 * status changes. We:
 *   1. decrypt it to recover the PlatiOnline transaction id (for the handshake),
 *   2. hand the raw payload to Medusa's payment webhook pipeline (which queries
 *      the real status and runs processPaymentWorkflow), and
 *   3. return the mandatory `<po_itsn_response>` acknowledgement.
 *
 * PlatiOnline retries (up to 72h) until it receives `f_response_code = 1`.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const options = loadPlatiOnlineOptionsFromEnv()

  // PlatiOnline posts application/x-www-form-urlencoded; fall back to rawBody.
  let body = (req.body ?? {}) as Record<string, unknown>
  if (!body.f_message && !body.f_relay_message && req.rawBody) {
    body = Object.fromEntries(new URLSearchParams(req.rawBody.toString()))
  }

  const respondXml = (xml: string) =>
    res.status(200).set("Content-Type", "text/xml; charset=utf-8").send(xml)

  let transactionId: string | undefined
  try {
    const ids = decryptItsnIds(options, body)
    transactionId = ids.transactionId

    // Reuse Medusa's webhook pipeline (getWebhookActionAndData + workflow),
    // including its built-in delay to avoid racing the storefront relay return.
    const eventBus = req.scope.resolve(Modules.EVENT_BUS)
    await eventBus.emit(
      {
        name: PaymentWebhookEvents.WebhookReceived,
        data: {
          provider: PROVIDER_ID,
          payload: { data: body, rawData: req.rawBody, headers: req.headers },
        },
      },
      { delay: 5000, attempts: 3 }
    )

    return respondXml(
      buildItsnResponse({
        responseCode: 1,
        merchServerStamp: options.website,
        transactionId: transactionId ?? "",
      })
    )
  } catch (err) {
    req.scope.resolve("logger").error(`PlatiOnline ITSN error: ${(err as Error).message}`)
    // Return 0 so PlatiOnline retries the notification.
    return respondXml(
      buildItsnResponse({
        responseCode: 0,
        merchServerStamp: (err as Error).message.slice(0, 200),
        transactionId: transactionId ?? "",
      })
    )
  }
}
