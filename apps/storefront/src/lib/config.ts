import Medusa from "@medusajs/js-sdk"

// Resolve the backend URL per runtime:
// - Browser → NEXT_PUBLIC_MEDUSA_BACKEND_URL (public, inlined at build time).
// - Server  → MEDUSA_BACKEND_URL when set (e.g. Railway's private network,
//   http://backend.railway.internal:PORT — no public hop, no egress cost),
//   otherwise it falls back to the public URL below.
// - BUILD   → always the public URL: Railway's private network is only
//   available at runtime, so generateStaticParams/prerender fetches during
//   `next build` would fail against the private domain.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build"

let backendUrl = "http://localhost:9000"

if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
  backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
}

if (
  typeof window === "undefined" &&
  !isBuildPhase &&
  process.env.MEDUSA_BACKEND_URL
) {
  backendUrl = process.env.MEDUSA_BACKEND_URL
}

// Expus pentru diagnostic: distinge "a căzut pe URL-ul public" de "folosește
// privatul", ceea ce din afară arată identic (aceeași eroare generică).
export const resolvedBackendUrl = backendUrl

// Un singur rând la pornirea procesului server, care arată exact CARE dintre
// cele trei condiții de mai sus a decis URL-ul. Fără el, "variabila lipsește
// la runtime", "NEXT_PHASE a rămas setat din build" și "variabila e string gol"
// arată identic din afară: toate trei cad tăcut pe URL-ul public.
if (typeof window === "undefined") {
  const raw = process.env.MEDUSA_BACKEND_URL
  console.log(
    `[config] backendUrl=${backendUrl} ` +
      `MEDUSA_BACKEND_URL=${raw === undefined ? "ABSENTĂ" : raw === "" ? "STRING GOL" : raw} ` +
      `NEXT_PHASE=${process.env.NEXT_PHASE ?? "-"} isBuildPhase=${isBuildPhase}`
  )
}

export const sdk = new Medusa({
  baseUrl: backendUrl,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  // Node's fetch sends no User-Agent by default — when backendUrl is the
  // public https://admin.thehunter.ro (no MEDUSA_BACKEND_URL private-network
  // override set), every server-side SDK call routes through Cloudflare and
  // was being blocked by the WAF rule that rejects empty User-Agents,
  // returning its HTML block page instead of JSON. `sdk.client.fetch` then
  // tried to JSON.parse that HTML and threw "Unexpected token '<'". Browsers
  // treat User-Agent as a forbidden header and silently keep the real one,
  // so this is a no-op (harmless) for client-side calls.
  globalHeaders: { "User-Agent": "TheHunterStorefront/1.0" },
})

// NOTE: do NOT monkey-patch sdk.client.fetch to inject the locale cookie
// globally. Reading cookies() inside every SDK call silently opts EVERY
// route that fetches server-side (the Nav does, on all pages) into dynamic
// rendering — that's what kept /, /ready-to-wear, /faq etc. from being static.
// Locale-dependent flows pass the locale explicitly instead (see cart.ts,
// which sets it at cart creation).
