import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, PaymentWebhookEvents } from "@medusajs/framework/utils"
import { createVerify } from "crypto"

const PROVIDER_ID = process.env.NETOPIA_PROVIDER_ID || "netopia_netopia"

type IpnVerification =
  | "valid" // signature present and cryptographically verified
  | "invalid" // signature present and verification failed (or threw)
  | "unsigned" // no recognised signature field on the request
  | "unconfigured" // NETOPIA_PUBLIC not set — cannot verify at all

/**
 * Verifies the RSA signature on a Netopia IPN.
 *
 * KNOWN GAP — must be confirmed against real Netopia v2 traffic:
 * the field names probed below (`x-netopia-signature`, `Authorization: Bearer`,
 * `payload.signature`) are NOT documented by Netopia anywhere in this repo, and
 * the signed-payload construction (`JSON.stringify(payload)`) is a guess too —
 * a real scheme almost certainly signs the raw request body bytes, not a
 * re-serialisation of the parsed object.
 *
 * The endpoint fails CLOSED on anything that isn't a verified signature —
 * invalid, unsigned and unconfigured all return 401. Because the field names
 * above are unconfirmed, that may reject every genuine IPN until they are
 * corrected; this is an accepted, deliberate tradeoff, safe because order
 * completion does not depend on this endpoint (the return page polls and
 * completes the cart, and authorization is re-verified server-to-server via
 * getPaymentStatus using the server-stored ntpID).
 *
 * TO CONFIRM IN PRODUCTION: watch for `Netopia IPN RESPINS (unsigned)` in the
 * logs after a real payment. Its presence means the signature arrives under a
 * different field/format — capture that IPN's headers and raw body, correct the
 * lookup and the signed-bytes construction here, and the webhook path resumes.
 * Orders keep completing via polling in the meantime.
 */
function verifyIpnSignature(
  payload: unknown,
  rawBody: Buffer | undefined,
  headers: Record<string, unknown>
): IpnVerification {
  const rawPublic = process.env.NETOPIA_PUBLIC
  if (!rawPublic) return "unconfigured"

  const signature =
    (headers["x-netopia-signature"] as string | undefined) ||
    (headers["authorization"] as string | undefined)?.replace(/^Bearer\s+/, "") ||
    ((payload as any)?.signature as string | undefined)

  if (!signature) return "unsigned"

  try {
    const pem = rawPublic.startsWith("-----")
      ? rawPublic
      : `-----BEGIN CERTIFICATE-----\n${rawPublic.match(/.{1,64}/g)!.join("\n")}\n-----END CERTIFICATE-----`

    // Prefer the raw bytes as received — re-serialising the parsed object
    // reorders/reformats keys and would break a genuine signature.
    const signed = rawBody ?? Buffer.from(JSON.stringify(payload), "utf8")

    const verifier = createVerify("RSA-SHA256")
    verifier.update(signed)
    return verifier.verify(pem, signature, "base64") ? "valid" : "invalid"
  } catch {
    // Malformed certificate/signature must never count as a pass.
    return "invalid"
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

  const verification = verifyIpnSignature(
    body,
    req.rawBody as Buffer | undefined,
    req.headers as Record<string, unknown>
  )

  // Fail closed in every case that isn't a cryptographically verified signature.
  //
  // The signature field/format is still unconfirmed against real Netopia v2
  // traffic (see verifyIpnSignature). If the probed field names are wrong, EVERY
  // genuine IPN is rejected here — which is a deliberate, informed choice: order
  // completion does not depend on this endpoint. The return page polls and
  // completes the cart independently, and authorization is re-checked
  // server-to-server via getPaymentStatus, so a rejected IPN delays the webhook
  // path rather than losing the order.
  //
  // The rejection reason is logged at error level precisely so a wrong field
  // name is obvious in production instead of looking like silence.
  if (verification !== "valid") {
    const reason = {
      invalid: "semnătură invalidă",
      unsigned:
        "lipsă semnătură — niciun câmp recunoscut (x-netopia-signature / " +
        "Authorization / body.signature); dacă TOATE IPN-urile sunt respinse, " +
        "numele real al câmpului diferă și trebuie confirmat dintr-un IPN real",
      unconfigured: "NETOPIA_PUBLIC nu este configurat — verificarea e imposibilă",
    }[verification]

    logger.error(`Netopia IPN RESPINS (${verification}): ${reason}`)
    return res.status(401).json({ errorCode: 1, message: "Invalid signature" })
  }

  const ipnStatus = (body as any)?.payment?.status
  const orderID = (body as any)?.order?.orderID as string | undefined

  const eventBus = req.scope.resolve(Modules.EVENT_BUS)

  // ACK ÎNAINTE de procesare. Netopia așteaptă răspunsul IPN cu un timeout scurt
  // și, dacă întârzie, afișează "eroare generală" pe pagina de plată chiar și
  // după o plată reușită. Punem Redis (`emit`) în afara căii critice a
  // răspunsului: confirmăm recepția întâi, apoi emitem evenimentele.
  //
  // Fereastra "ack trimis, dar eveniment pierdut la un restart" e acoperită de
  // redundanță: Netopia reîncearcă IPN-ul, iar pagina de return face polling și
  // completează coșul independent — comenzile se finalizează oricum.
  res.status(200).json({ errorCode: 0 })

  void (async () => {
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

    // Eveniment custom — subscriber-ul completează coșul după ce sesiunea e autorizată.
    // orderID e generat de noi la initiatePayment (= payment session id), deci
    // filtrăm formatul ca să nu declanșăm workflow-uri pe input arbitrar.
    // `sess_` acoperă fallback-ul din initiatePayment când lipsește idempotency_key.
    const isSessionId =
      typeof orderID === "string" && /^(ps|sess)_[A-Za-z0-9_-]{1,64}$/.test(orderID)

    if ((ipnStatus === 3 || ipnStatus === 5) && isSessionId) {
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
  })()
}
