import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["ro", "en"],
  defaultLocale: "ro",
  // NOTE: localeDetection must stay enabled (the default). next-intl gates
  // BOTH the locale cookie check and Accept-Language negotiation behind
  // this single flag (see resolveLocale.js in next-intl's middleware
  // source) — setting it to false doesn't just stop Accept-Language
  // auto-detection, it also stops the middleware from ever reading the
  // `_medusa_locale` cookie, silently breaking manual language switching
  // (cookie updates to "en" but every page still renders "ro"). The
  // Accept-Language negotiation is disabled separately, in middleware.ts,
  // by stripping that header before this config is consulted.
  localePrefix: "never",
  localeCookie: {
    name: "_medusa_locale",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "strict",
    secure: false,
  },
})
