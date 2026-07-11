import { getLocaleHeader } from "@lib/util/get-locale-header"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

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

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = init?.headers ?? {}
  let localeHeader: Record<string, string | null> | undefined
  try {
    localeHeader = await getLocaleHeader()
    headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
  } catch {}

  const newHeaders = {
    ...localeHeader,
    ...headers,
  }
  init = {
    ...init,
    headers: newHeaders,
  }
  return originalFetch(input, init)
}
