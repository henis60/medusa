import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, PaymentWebhookEvents } from "@medusajs/framework/utils"
import {
  createHash,
  createPublicKey,
  createVerify,
  KeyObject,
  X509Certificate,
} from "crypto"

const PROVIDER_ID = process.env.NETOPIA_PROVIDER_ID || "netopia_netopia"

type IpnVerification =
  | "valid" // signature present and cryptographically verified
  | "invalid" // signature present and verification failed (or threw)
  | "unsigned" // no recognised signature field on the request
  | "unconfigured" // NETOPIA_PUBLIC not set — cannot verify at all

// Motivul exact al respingerii — DOAR pentru loguri, niciodată în răspuns.
// "invalid" acoperă șase cauze distincte cu remedii complet diferite
// (certificat greșit vs POS signature de alt mediu vs corp modificat pe drum),
// iar fără detaliu nu se poate alege între ele.
type IpnDetail = { result: IpnVerification; detail: string }

/**
 * Verifică autenticitatea unui IPN Netopia v2.
 *
 * Schema (confirmată din SDK-urile oficiale Netopia, ex. go-sdk `ipn.go`):
 *  - header-ul `Verification-token` conține un JWT semnat RSA de Netopia;
 *  - semnătura se verifică cu cheia publică din certificatul NETOPIA_PUBLIC;
 *  - `iss` trebuie să fie exact "NETOPIA Payments";
 *  - `aud` (string sau primul element din array) trebuie să fie POS signature-ul nostru;
 *  - `sub` este base64( sha512( bytes-ul BRUT al body-ului ) ) — deci hash-ul se
 *    calculează pe `rawBody`, niciodată pe o re-serializare a obiectului parsat,
 *    care ar reordona cheile și ar strica potrivirea.
 *
 * Endpoint-ul dă fail CLOSED: orice altceva decât "valid" înseamnă 401.
 */
function verifyIpnSignature(
  rawBody: Buffer | undefined,
  headers: Record<string, unknown>
): IpnDetail {
  const bad = (detail: string): IpnDetail => ({ result: "invalid", detail })

  const rawPublic = process.env.NETOPIA_PUBLIC
  if (!rawPublic)
    return { result: "unconfigured", detail: "NETOPIA_PUBLIC lipsește" }

  const posSignature =
    process.env.NETOPIA_ID || process.env.NETOPIA_POS_SIGNATURE || ""
  if (!posSignature)
    return { result: "unconfigured", detail: "NETOPIA_ID lipsește" }

  const token = headers["verification-token"] as string | undefined
  if (!token)
    return { result: "unsigned", detail: "header Verification-token absent" }
  if (token.split(".").length !== 3)
    return {
      result: "unsigned",
      detail: `Verification-token nu are 3 segmente (are ${token.split(".").length})`,
    }

  // Fără body-ul brut nu putem valida `sub`, deci nu putem avea încredere.
  if (!rawBody)
    return bad("rawBody indisponibil — verifică preserveRawBody în middlewares")

  try {
    // Netopia distribuie cheia de verificare în două forme, în funcție de cont
    // și de mediu: un certificat X.509 (`BEGIN CERTIFICATE`) sau cheia publică
    // brută SPKI (`BEGIN PUBLIC KEY`). Sunt structuri ASN.1 diferite —
    // `X509Certificate` o respinge pe a doua — așa că le tratăm separat.
    // Fără delimitatori, presupunem certificat (forma istorică) și, dacă nu
    // se parsează, reîncercăm ca SPKI.
    const trimmed = rawPublic.trim()
    const pem = trimmed.startsWith("-----")
      ? trimmed
      : `-----BEGIN CERTIFICATE-----\n${trimmed.match(/.{1,64}/g)!.join("\n")}\n-----END CERTIFICATE-----`

    let publicKey: KeyObject
    let keySource: string
    try {
      if (pem.includes("BEGIN PUBLIC KEY")) {
        publicKey = createPublicKey(pem)
        keySource = "SPKI public key"
      } else {
        publicKey = new X509Certificate(pem).publicKey
        keySource = "certificat X.509"
      }
    } catch (err) {
      // Base64 fără delimitatori poate fi oricare din cele două — dacă
      // împachetarea ca certificat a eșuat, încearcă drept cheie publică.
      try {
        publicKey = createPublicKey(
          `-----BEGIN PUBLIC KEY-----\n${trimmed.match(/.{1,64}/g)!.join("\n")}\n-----END PUBLIC KEY-----`
        )
        keySource = "SPKI public key (fallback)"
      } catch {
        return bad(
          `NETOPIA_PUBLIC nu e nici certificat X.509, nici cheie publică SPKI: ${(err as Error).message}`
        )
      }
    }

    const [headerB64, payloadB64, signatureB64] = token.split(".")
    const jwtHeader = JSON.parse(
      Buffer.from(headerB64, "base64url").toString("utf8")
    )

    // Doar RSA. Refuzăm explicit "none"/HMAC — altfel oricine poate forja un token.
    if (!/^RS(256|384|512)$/.test(jwtHeader?.alg ?? ""))
      return bad(`alg neacceptat: ${JSON.stringify(jwtHeader?.alg)}`)

    const verifier = createVerify(`RSA-SHA${jwtHeader.alg.slice(2)}`)
    verifier.update(`${headerB64}.${payloadB64}`)
    if (!verifier.verify(publicKey, Buffer.from(signatureB64, "base64url"))) {
      // Identifică materialul de cheie folosit, ca să se poată compara cu ce a
      // trimis Netopia: sandbox și live semnează cu chei diferite, iar o
      // nepotrivire de mediu arată exact ca o semnătură falsă.
      return bad(
        `semnătura RSA nu se verifică cu NETOPIA_PUBLIC (alg=${jwtHeader.alg}) — ` +
          `sursă=${keySource} tip=${publicKey.asymmetricKeyType} ` +
          `biți=${publicKey.asymmetricKeyDetails?.modulusLength ?? "?"}`
      )
    }

    const claims = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    )

    if (claims?.iss !== "NETOPIA Payments")
      return bad(`iss neașteptat: ${JSON.stringify(claims?.iss)}`)

    const aud = Array.isArray(claims?.aud) ? claims.aud[0] : claims?.aud
    if (!aud || aud !== posSignature) {
      // Valorile se loghează mascat: sunt identificatori de POS, nu secrete,
      // dar nu au ce căuta întregi în loguri.
      return bad(
        `aud != NETOPIA_ID (aud=${maskId(aud)} vs configurat=${maskId(posSignature)}) ` +
          `— tipic chei de sandbox contra live sau invers`
      )
    }

    const bodyHash = createHash("sha512").update(rawBody).digest("base64")
    if (claims?.sub !== bodyHash) {
      return bad(
        `hash body != sub (body ${rawBody.length}B) — corpul a fost modificat ` +
          `pe drum sau nu e cel brut`
      )
    }

    return { result: "valid", detail: "ok" }
  } catch (err) {
    return bad(`excepție: ${(err as Error).name}: ${(err as Error).message}`)
  }
}

function maskId(value: unknown): string {
  if (typeof value !== "string" || !value) return String(value)
  return value.length <= 8
    ? `${value.slice(0, 2)}…`
    : `${value.slice(0, 4)}…${value.slice(-4)}`
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
    req.rawBody as Buffer | undefined,
    req.headers as Record<string, unknown>
  )

  // Fail closed: orice altceva decât o semnătură verificată criptografic → 401.
  // Chiar dacă un IPN e respins, comanda nu se pierde — pagina de return face
  // polling și completează coșul, iar autorizarea e reverificată
  // server-to-server prin getPaymentStatus cu ntpID-ul stocat la noi.
  if (verification.result !== "valid") {
    // Detaliul merge DOAR în loguri — răspunsul rămâne generic, ca să nu ofere
    // unui atacator un oracol despre care verificare a picat.
    logger.error(
      `Netopia IPN RESPINS (${verification.result}): ${verification.detail}`
    )
    return res.status(401).json({ errorCode: 1, message: "Invalid signature" })
  }

  const ipnStatus = (body as any)?.payment?.status
  const orderID = (body as any)?.order?.orderID as string | undefined
  const ntpID = (body as any)?.payment?.ntpID as string | undefined

  // Dovada că verificarea IPN chiar trece la live — până acum n-a trecut
  // niciodată, deci prezența acestei linii e primul lucru de căutat în loguri.
  logger.info(
    `Netopia IPN ACCEPTAT: orderID=${orderID ?? "-"} ntpID=${ntpID ?? "-"} ` +
      `status=${String(ipnStatus ?? "-")}`,
  )

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
    // orderID e payment session id-ul generat la initiatePayment. Verificăm doar
    // FORMA, nu prefixul: o versiune anterioară cerea `ps_`/`sess_`, dar Medusa
    // emite id-uri cu prefixul `payses_`, deci condiția nu se potrivea niciodată
    // și evenimentul de finalizare nu se emitea pentru nicio plată reală.
    const isSessionId =
      typeof orderID === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(orderID)

    if ((ipnStatus === 3 || ipnStatus === 5) && isSessionId) {
      try {
        await eventBus.emit(
          {
            name: "netopia.payment.authorized",
            data: { session_id: orderID },
          },
          { delay: 7000, attempts: 3 }
        )
        logger.info(
          `Netopia IPN: emis netopia.payment.authorized pentru session_id=${orderID}`
        )
      } catch (err) {
        logger.error(`Netopia IPN custom event error: ${(err as Error).message}`)
      }
    } else {
      // Explică de ce NU s-a emis evenimentul de finalizare — altfel un IPN
      // acceptat care nu duce la comandă arată ca tăcere totală.
      logger.info(
        `Netopia IPN: fără eveniment de finalizare — status=${String(ipnStatus ?? "-")} ` +
          `orderID=${orderID ?? "-"} formăValidă=${isSessionId}`
      )
    }
  })()
}
