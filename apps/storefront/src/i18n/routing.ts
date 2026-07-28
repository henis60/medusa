import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["ro", "en"],
  defaultLocale: "ro",
  // Without this, next-intl's default behavior negotiates a locale from the
  // browser's Accept-Language header on a visitor's first request (before
  // the _medusa_locale cookie exists), only falling back to defaultLocale
  // if nothing matches — so an English-language browser would land on the
  // English variant by default. This is a Romania-focused store: `ro` should
  // always be the default regardless of visitor browser settings, only
  // changing via the explicit language switcher.
  localeDetection: false,
  localePrefix: "never",
  localeCookie: {
    name: "_medusa_locale",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "strict",
    secure: false,
  },
})
