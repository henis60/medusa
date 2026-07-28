import { cache } from "react"

// A per-request slot for the current locale, populated once (from the plain
// [locale] route param — a build-time-known string, no I/O) at the top of
// the tree in src/app/[locale]/layout.tsx, and read anywhere below it.
//
// This deliberately avoids cookies()/headers() and next-intl's own
// getLocale(): both are backed by Next.js's AsyncLocalStorage-based request
// context, which does not reliably survive a Promise.all fan-out — a
// concurrently-dispatched branch (e.g. Nav's Promise.all([listCategories(),
// listCollections(), ...])) can lose that context entirely, throwing
// "headers was called outside a request scope" even though a real request
// is in flight. React's cache() is scoped to the render pass itself, not to
// Node's AsyncLocalStorage, so it isn't subject to the same failure mode.
const requestLocaleStore = cache(() => ({ current: null as string | null }))

export function setRequestLocaleValue(locale: string): void {
  requestLocaleStore().current = locale
}

export function getRequestLocaleValue(): string | null {
  return requestLocaleStore().current
}

const DEFAULT_LOCALE = "ro"

// Maps our simple locale codes to the BCP 47 codes Medusa's translation
// module stores/matches against (seeded default locales include "ro-RO",
// "en-US" — see @medusajs/translation's loaders/defaults). Extend this if
// more locales are added to src/i18n/routing.ts.
const BCP47_BY_LOCALE: Record<string, string> = {
  ro: "ro-RO",
  en: "en-GB",
}

/**
 * Header to attach to Medusa SDK calls so store routes (query.graph/
 * query.index under the hood) return content translated via Medusa's native
 * translation module. Returns {} for the default locale (ro) — the base
 * entity content already is Romanian, so there's nothing to overlay, and
 * omitting the header matches how Medusa's own apply-locale middleware
 * treats a missing/empty x-medusa-locale (no-op, base content returned).
 */
export function getMedusaLocaleHeaders(
  overrideLocale?: string
): Record<string, string> {
  // Server Actions ("use server" functions invoked directly from Client
  // Components, e.g. infinite scroll / wishlist) run as their own RPC
  // outside any page/layout render, so there's no route [locale] param to
  // seed the cache() value from — callers there must pass the client's
  // current locale (e.g. via next-intl's useLocale()) explicitly.
  const locale = overrideLocale ?? getRequestLocaleValue()
  if (!locale || locale === DEFAULT_LOCALE) return {}
  const bcp47 = BCP47_BY_LOCALE[locale]
  return bcp47 ? { "x-medusa-locale": bcp47 } : {}
}
