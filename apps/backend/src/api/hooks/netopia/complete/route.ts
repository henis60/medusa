import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const STOREFRONT_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8000"

/**
 * Netopia return redirect handler.
 *
 * Netopia trimite browserul aici după plată cu query params:
 *   ?errorCode=0&status=...&session_id=...
 *
 * errorCode=0 → plată reușită (sau în procesare) → polling în storefront
 * errorCode≠0 → plată eșuată → redirect direct cu failed=1
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const sessionId = req.query.session_id as string | undefined
  const errorCode = req.query.errorCode as string | undefined
  const ntpStatus = req.query.status as string | undefined

  if (!sessionId) {
    return res.redirect(`${STOREFRONT_URL}/cart`)
  }

  const returnBase = `${STOREFRONT_URL}/checkout/netopia/return`

  // errorCode != 0 sau status explicit de eroare → card refuzat / anulat
  const failed =
    (errorCode !== undefined && errorCode !== "0") ||
    ntpStatus === "12" ||
    ntpStatus === "REJECTED"

  if (failed) {
    return res.redirect(`${returnBase}?session_id=${sessionId}&failed=1`)
  }

  return res.redirect(`${returnBase}?session_id=${sessionId}`)
}
