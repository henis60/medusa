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
] as const

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

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
