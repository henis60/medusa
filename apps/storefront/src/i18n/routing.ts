import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["ro", "en"],
  defaultLocale: "ro",
  localePrefix: "never",
  localeCookie: {
    name: "_medusa_locale",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "strict",
    secure: false,
  },
})
