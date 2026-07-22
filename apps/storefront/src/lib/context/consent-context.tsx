"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { Cookies, getCookieConsentValue } from "react-cookie-consent"

export type ConsentValue = "granted" | "denied"

type ConsentContextType = {
  /** null until a choice has been made (or restored from the cookie). */
  consent: ConsentValue | null
  /** False until the consent cookie has been read on mount. */
  loaded: boolean
  accept: () => void
  reject: () => void
}

const ConsentContext = createContext<ConsentContextType>({
  consent: null,
  loaded: false,
  accept: () => {},
  reject: () => {},
})

/**
 * Single source of truth is the react-cookie-consent cookie. The banner reads
 * it natively to decide its own visibility; this provider reads the same cookie
 * to drive Google Consent Mode (gtag) and to expose accept/reject for the
 * cookie-settings page. `cookieValue`/`declineCookieValue` match the library
 * defaults ("true"/"false").
 */
export const CONSENT_COOKIE = "the_hunter_cookie_consent"
const ACCEPT_VALUE = "true"
const DECLINE_VALUE = "false"

function pushConsentUpdate(value: ConsentValue) {
  if (typeof window === "undefined" || !window.gtag) return
  window.gtag("consent", "update", {
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  })
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentValue | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = getCookieConsentValue(CONSENT_COOKIE)
    if (stored === ACCEPT_VALUE) {
      setConsent("granted")
      pushConsentUpdate("granted")
    } else if (stored === DECLINE_VALUE) {
      setConsent("denied")
      pushConsentUpdate("denied")
    }
    setLoaded(true)
  }, [])

  const persist = (value: ConsentValue) => {
    setConsent(value)
    Cookies.set(
      CONSENT_COOKIE,
      value === "granted" ? ACCEPT_VALUE : DECLINE_VALUE,
      { expires: 365, sameSite: "lax" }
    )
    pushConsentUpdate(value)
  }

  return (
    <ConsentContext.Provider
      value={{
        consent,
        loaded,
        accept: () => persist("granted"),
        reject: () => persist("denied"),
      }}
    >
      {children}
    </ConsentContext.Provider>
  )
}

export const useConsent = () => useContext(ConsentContext)
