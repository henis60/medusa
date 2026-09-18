import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"

// Grows one namespace at a time as each module gets translated — add the
// name here once its messages/{locale}/<name>.json files exist.
const NAMESPACES = [
  "common",
  "layout",
  "home",
  "products",
  "store",
  "cart",
  "checkout",
  "order",
  "account",
  "legal",
  "pages",
  "contact",
  "programare",
  "categories",
  "collections",
  "customer-service",
  "faq",
  "shipping",
  "wishlist",
  "app",
  "meridian",
] as const

export default getRequestConfig(async ({ requestLocale, locale: explicitLocale }) => {
  // Prefer an explicitly-passed locale (next-intl forwards the one given to
  // e.g. `getTranslations({locale})`) and only fall back to `requestLocale`,
  // which reads headers. That read is what turned every unmatched dotted URL
  // into a 500: such paths skip the locale middleware (see middleware.ts's
  // HAS_FILE_EXTENSION bypass), fall through to the root not-found.tsx that
  // Next prerenders statically as /_not-found, and its NotFoundContent asks
  // for translations with an explicit locale — so reading headers anyway made
  // the route dynamic at runtime and Next threw "Page changed from static to
  // dynamic" instead of rendering the 404.
  let locale = explicitLocale ?? (await requestLocale)

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale
  }

  const namespaceModules = await Promise.all(
    NAMESPACES.map((namespace) =>
      import(`../../messages/${locale}/${namespace}.json`).then(
        (mod) => [namespace, mod.default] as const
      )
    )
  )

  const messages = Object.fromEntries(namespaceModules)

  return {
    locale,
    messages,
  }
})
