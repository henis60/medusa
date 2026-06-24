import { decryptMessage } from "./crypto"
import { PlatiOnlineClient } from "./client"
import { getXmlTag } from "./xml"
import { mapFinStatus, PaymentAction } from "./status"
import { PlatiOnlineOptions } from "./types"
import { PaymentSessionStatus } from "@medusajs/framework/types"

export type ItsnResult = {
  /** Medusa payment session id (sent to PlatiOnline as f_order_number). */
  sessionId?: string
  /** PlatiOnline transaction id, echoed back in the ITSN acknowledgement. */
  transactionId?: string
  amount?: number
  action: PaymentAction
  sessionStatus: PaymentSessionStatus
  statusFin1?: number
}

/**
 * Decrypts an ITSN body and extracts only the identifiers — no network call.
 * Used by the ITSN route to build the synchronous acknowledgement handshake.
 */
export function decryptItsnIds(
  options: PlatiOnlineOptions,
  body: Record<string, unknown>
): { sessionId?: string; transactionId?: string } {
  const xml = decryptItsnBody(options, body)
  return {
    sessionId: getXmlTag(xml, "f_order_number"),
    transactionId: getXmlTag(xml, "x_trans_id"),
  }
}

/**
 * Decrypts an incoming ITSN body to its plaintext XML. Shared by
 * {@link decryptItsnIds} and {@link processItsn}.
 */
function decryptItsnBody(
  options: PlatiOnlineOptions,
  body: Record<string, unknown>
): string {
  const message = (body.f_message ?? body.f_relay_message) as string | undefined
  const cryptMessage = body.f_crypt_message as string | undefined

  if (!message || !cryptMessage) {
    throw new Error("ITSN body missing f_message / f_crypt_message")
  }

  return decryptMessage(message, cryptMessage, {
    iv: options.ivItsn,
    merchantPrivateKey: options.merchantPrivateKey,
  })
}

/**
 * Processes an incoming ITSN notification body: decrypts it, extracts the
 * order/transaction ids, then queries PlatiOnline for the real status (the
 * ITSN itself only signals that the status changed).
 *
 * Shared by the provider's `getWebhookActionAndData` and the ITSN route.
 */
export async function processItsn(
  options: PlatiOnlineOptions,
  body: Record<string, unknown>
): Promise<ItsnResult> {
  const xml = decryptItsnBody(options, body)

  const sessionId = getXmlTag(xml, "f_order_number")
  const transactionId = getXmlTag(xml, "x_trans_id")

  if (!transactionId) {
    throw new Error("ITSN message missing x_trans_id")
  }

  // ITSN only signals a change — query for the actual status.
  const client = new PlatiOnlineClient(options)
  const result = await client.query({
    transactionId,
    orderNumber: sessionId,
    testMode: !!options.testMode,
  })

  const mapped =
    result.statusFin1 !== undefined
      ? mapFinStatus(result.statusFin1)
      : { sessionStatus: "pending" as PaymentSessionStatus, action: "pending" as PaymentAction }

  return {
    sessionId: result.orderNumber ?? sessionId,
    transactionId: result.transactionId ?? transactionId,
    amount: result.amount,
    action: mapped.action,
    sessionStatus: mapped.sessionStatus,
    statusFin1: result.statusFin1,
  }
}
