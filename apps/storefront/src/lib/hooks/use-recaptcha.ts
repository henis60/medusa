"use client"

import { useCallback, useRef } from "react"

const RECAPTCHA_SITEKEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!
const SCRIPT_ID = "recaptcha-v3-script"

declare global {
  interface Window {
    grecaptcha: any
  }
}

function loadRecaptchaScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject()
    if (window.grecaptcha) return resolve()

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () => reject())
      return
    }

    const script = document.createElement("script")
    script.id = SCRIPT_ID
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITEKEY}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject()
    document.head.appendChild(script)
  })
}

/**
 * Lazy reCAPTCHA v3: the ~200KB Google script is NOT loaded on page render.
 * Wire `preload` to the form's first user interaction (e.g. onFocusCapture)
 * so the script downloads while the user types, and call `getToken` on
 * submit. If the user submits before the script finished loading, getToken
 * awaits the same in-flight load.
 */
export function useRecaptcha() {
  const loadPromise = useRef<Promise<void> | null>(null)

  const preload = useCallback(() => {
    if (!loadPromise.current) {
      loadPromise.current = loadRecaptchaScript()
    }
    return loadPromise.current
  }, [])

  const getToken = useCallback(
    async (action: string): Promise<string | null> => {
      try {
        await preload()
        await new Promise<void>((resolve) => window.grecaptcha.ready(resolve))
        return await window.grecaptcha.execute(RECAPTCHA_SITEKEY, { action })
      } catch {
        return null
      }
    },
    [preload]
  )

  return { preload, getToken }
}
