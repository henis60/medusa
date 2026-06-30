import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, PaymentWebhookEvents } from "@medusajs/framework/utils"
import { createVerify } from "crypto"

const PROVIDER_ID = process.env.NETOPIA_PROVIDER_ID || "pp_netopia_netopia"

function verifyIpnSignature(
  payload: unknown,
  headers: Record<string, unknown>
): boolean {
  const rawPublic = process.env.NETOPIA_PUBLIC
  if (!rawPublic) return true

  const signature =
    (headers["x-netopia-signature"] as string | undefined) ||
    (headers["authorization"] as string | undefined)?.replace(/^Bearer\s+/, "") ||
    (payload as any)?.signature

  if (!signature) return true

  try {
    const pem = rawPublic.startsWith("-----")
      ? rawPublic
      : `-----BEGIN CERTIFICATE-----\n${rawPublic.match(/.{1,64}/g)!.join("\n")}\n-----END CERTIFICATE-----`

    const verifier = createVerify("RSA-SHA256")
    verifier.update(JSON.stringify(payload))
    return verifier.verify(pem, signature, "base64")
  } catch {
    return true
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")
  let body: unknown = req.body

  if ((!body || typeof body !== "object" || !(body as any).payment) && req.rawBody) {
    try {
      body = JSON.parse(req.rawBody.toString("utf8"))
    } catch {
      // fall through
    }
  }

  if (!verifyIpnSignature(body, req.headers as Record<string, unknown>)) {
    logger.warn("Netopia IPN: semnătură invalidă — cerere respinsă")
    return res.status(401).json({ errorCode: 1, message: "Invalid signature" })
  }

  const ipnStatus = (body as any)?.payment?.status
  const orderID = (body as any)?.order?.orderID as string | undefined

  const eventBus = req.scope.resolve(Modules.EVENT_BUS)

  // Eveniment pentru Medusa — actualizează payment session
  try {
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
  } catch (err) {
    logger.error(`Netopia IPN emit error: ${(err as Error).message}`)
  }

  // Eveniment custom — subscriber-ul completează coșul după ce sesiunea e autorizată
  if ((ipnStatus === 3 || ipnStatus === 5) && orderID) {
    try {
      await eventBus.emit(
        {
          name: "netopia.payment.authorized",
          data: { session_id: orderID },
        },
        { delay: 7000, attempts: 3 }
      )
    } catch (err) {
      logger.error(`Netopia IPN custom event error: ${(err as Error).message}`)
    }
  }

  return res.status(200).json({ errorCode: 0 })
}
