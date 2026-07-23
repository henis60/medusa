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

export const sdk = new Medusa({
  baseUrl: backendUrl,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

// NOTE: do NOT monkey-patch sdk.client.fetch to inject the locale cookie
// globally. Reading cookies() inside every SDK call silently opts EVERY
// route that fetches server-side (the Nav does, on all pages) into dynamic
// rendering — that's what kept /, /ready-to-wear, /faq etc. from being static.
// Locale-dependent flows pass the locale explicitly instead (see cart.ts,
// which sets it at cart creation).
