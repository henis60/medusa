import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

// The storefront base URL is configured as VITE_STOREFRONT_URL across the
// backend (subscribers, admin). NEXT_PUBLIC_BASE_URL is not set here, so fall
// back to VITE_STOREFRONT_URL before the localhost default — otherwise the
// post-payment return redirect sends the shopper to localhost.
const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  process.env.VITE_STOREFRONT_URL ??
  "http://localhost:8000";

/**
 * Netopia return redirect handler.
 *
 * Netopia trimite browserul aici după plată cu query params:
 *   ?errorCode=0&status=...&session_id=...
 *
 * errorCode=0 → plată reușită (sau în procesare) → polling în storefront
 * errorCode≠0 → plată eșuată → redirect direct cu failed=1
 *
 * Pe mobile, după provocarea 3DS, Netopia întoarce browserul printr-un POST
 * (formular auto-submit din pagina ACS), nu printr-un GET ca pe desktop. Fără
 * un handler POST, cererea primea 404 și Netopia afișa „eroare generală"
 * înainte de redirect. Tratăm ambele metode identic.
 */
function handleReturn(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const sessionId = (req.query.session_id ?? body.session_id) as
    | string
    | undefined;
  const errorCode = (req.query.errorCode ?? body.errorCode) as
    | string
    | undefined;
  const ntpStatus = (req.query.status ?? body.status) as string | undefined;
  // Stamped onto redirectUrl at payment initiation (see NetopiaProviderService
  // .initiatePayment) so the storefront doesn't have to rely on its locale
  // cookie surviving this cross-site redirect — must be forwarded, not
  // dropped, or the return page always renders in the default locale.
  const locale = (req.query.locale ?? body.locale) as string | undefined;
  const localeQS = locale ? `&locale=${encodeURIComponent(locale)}` : "";

  if (!sessionId) {
    return res.redirect(`${STOREFRONT_URL}/cos`);
  }

  const returnBase = `${STOREFRONT_URL}/finalizare-comanda/netopia/return`;

  // errorCode != 0 sau status explicit de eroare → card refuzat / anulat
  const failed =
    (errorCode !== undefined && errorCode !== "0") ||
    ntpStatus === "12" ||
    ntpStatus === "REJECTED";

  if (failed) {
    return res.redirect(`${returnBase}?session_id=${sessionId}&failed=1${localeQS}`);
  }

  return res.redirect(`${returnBase}?session_id=${sessionId}${localeQS}`);
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  return handleReturn(req, res);
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  return handleReturn(req, res);
}
