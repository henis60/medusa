import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

/**
 * Token exchange as a plain function so HTTP routes (which cannot run a
 * workflow step directly) share the exact same credentials/error handling
 * instead of re-implementing the call inline.
 */
export async function fetchOblioToken(): Promise<string> {
  const clientId = process.env.OBLIO_CLIENT_ID
  const clientSecret = process.env.OBLIO_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("OBLIO_CLIENT_ID și OBLIO_CLIENT_SECRET lipsesc din .env")
  }

  // Calea corectă e /api/..., NU /business/api/... — aceasta din urmă întoarce
  // 404 (verificat). Nu s-a observat până acum pentru că OBLIO_DRY_RUN
  // întrerupe execuția înaintea oricărui apel HTTP.
  const response = await fetch("https://www.oblio.eu/api/authorize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Oblio autentificare eșuată: ${response.status} — ${text}`)
  }

  const data = await response.json()
  const token = data.access_token as string | undefined

  // Un 200 fără token e la fel de blocant ca o eroare, dar ar trece nevăzut
  // și ar eșua mai târziu, la emitere, cu un mesaj despre autorizare.
  if (!token) {
    throw new Error(
      `Oblio autentificare: răspuns 200 fără access_token — chei: ${Object.keys(data).join(", ")}`
    )
  }

  return token
}

/**
 * Validarea variabilelor citite direct la emitere. `cif` e obligatoriu în
 * payload-ul Oblio, dar era folosit fără verificare — o valoare absentă pleca
 * drept `undefined` și eșua la ei, cu un mesaj greu de legat de cauză.
 */
export function requireOblioCui(): string {
  const cui = process.env.OBLIO_CUI?.trim()
  if (!cui) {
    throw new Error(
      "OBLIO_CUI lipsește — este obligatoriu (se trimite ca `cif` la Oblio)"
    )
  }
  return cui
}

/** Prezența unui secret, niciodată valoarea. */
function present(v: string | undefined): string {
  return v ? `da (${v.length})` : "LIPSĂ"
}

export const oblioGetTokenStep = createStep(
  "oblio-get-token",
  async (_input: undefined, { container }) => {
    const logger = container.resolve("logger")

    if (process.env.OBLIO_DRY_RUN === "true") {
      logger.info("Oblio DRY_RUN: token fictiv")
      return new StepResponse("dry-run-token")
    }

    // Configurația efectivă, o dată per comandă: la primul test live ăsta e
    // primul lucru de citit, fiindcă o variabilă absentă arată altfel decât
    // una prezentă dar greșită. Secretele doar ca prezență/lungime.
    logger.info(
      `Oblio: autentificare — clientId=${present(process.env.OBLIO_CLIENT_ID)} ` +
        `clientSecret=${present(process.env.OBLIO_CLIENT_SECRET)} ` +
        `cui=${process.env.OBLIO_CUI ?? "LIPSĂ"} ` +
        `serie=${process.env.OBLIO_INVOICE_SERIES ?? "FCT (implicit)"} ` +
        `tip=${process.env.OBLIO_DOCUMENT_TYPE ?? "Factura (implicit)"} ` +
        `tva=${process.env.OBLIO_VAT_PERCENTAGE ?? "21 (implicit)"}`
    )

    const token = await fetchOblioToken()
    logger.info(`Oblio: token obținut (${token.length} caractere)`)
    return new StepResponse(token)
  }
)
