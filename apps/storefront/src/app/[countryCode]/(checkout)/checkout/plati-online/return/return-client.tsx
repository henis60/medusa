"use client"

import {
  completePlatiOnlineBySession,
  completePlatiOnlineCart,
} from "@lib/data/cart"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const MAX_ATTEMPTS = 15
const INTERVAL_MS = 2000

/**
 * PlatiOnline relay return: completes the cart (which authorizes the payment by
 * querying PlatiOnline) and redirects to the order confirmation. Retries while
 * the payment is still settling. The ITSN webhook is the server-side fallback.
 */
const PlatiOnlineReturn = ({
  sessionId,
  cartId,
}: {
  sessionId?: string
  cartId?: string
}) => {
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) ?? "ro"
  const [failed, setFailed] = useState(false)
  const attempts = useRef(0)

  useEffect(() => {
    if (!sessionId && !cartId) {
      setFailed(true)
      return
    }

    let active = true
    const tick = async () => {
      try {
        // Prefer session_id (always present from the relay URL); fall back to
        // the cart cookie when available.
        const res = sessionId
          ? await completePlatiOnlineBySession(sessionId)
          : await completePlatiOnlineCart(cartId!)
        if (!active) return
        if (res.orderId) {
          router.push(`/${countryCode}/order/${res.orderId}/confirmed`)
          return
        }
      } catch {
        // ignore and retry
      }

      attempts.current += 1
      if (attempts.current >= MAX_ATTEMPTS) {
        setFailed(true)
        return
      }
      if (active) setTimeout(tick, INTERVAL_MS)
    }

    tick()
    return () => {
      active = false
    }
  }, [cartId, countryCode, router])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-6 py-32 text-center">
      {!failed ? (
        <>
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--theme-border)]" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-hunter-gold" />
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-serif italic text-[26px] leading-tight text-[var(--theme-text)]">
              Confirmăm plata…
            </p>
            <p className="font-sans text-[11px] uppercase tracking-[5px] text-[var(--theme-text-muted)]">
              Nu închide această pagină
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[var(--theme-border)]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-hunter-gold">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" />
              <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex max-w-md flex-col gap-4">
            <p className="font-serif italic text-[26px] leading-tight text-[var(--theme-text)]">
              Plata se procesează
            </p>
            <p className="font-sans text-[13px] leading-relaxed text-[var(--theme-text-muted)]">
              Comanda ta este în curs de finalizare. Când plata este confirmată,
              vei primi un email cu detaliile comenzii, iar aceasta va apărea în
              secțiunea Comenzile mele.
            </p>
            <a
              href={`/${countryCode}/account/orders`}
              className="mt-4 inline-block border border-hunter-gold px-8 py-3 font-sans text-[10px] uppercase tracking-[4px] text-hunter-gold transition-colors hover:bg-hunter-gold hover:text-[#0D0D0D]"
            >
              Vezi comenzile mele
            </a>
          </div>
        </>
      )}
    </div>
  )
}

export default PlatiOnlineReturn
