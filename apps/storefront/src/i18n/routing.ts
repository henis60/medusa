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
    // "strict" (the previous value) is dropped by the browser on any
    // cross-site top-level navigation — including the redirect Netopia sends
    // the customer's browser back through after payment — so the locale
    // cookie never reached the middleware on that request and the return
    // page always fell back to defaultLocale ("ro"). "lax" still blocks the
    // cookie on cross-site subresource/XHR requests, but allows it on
    // top-level GET navigations like this one.
    sameSite: "lax",
    secure: false,
  },
})
