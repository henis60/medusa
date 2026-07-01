"use client"

import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

export default function NewsletterStatus({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) {
  const [subscribed, setSubscribed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const email = customer?.email

  useEffect(() => {
    if (!email) return
    fetch(`${BACKEND}/store/newsletter?email=${encodeURIComponent(email)}`, {
      headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
    })
      .then((r) => r.json())
      .then((d) => setSubscribed(d.subscribed ?? false))
      .catch(() => setSubscribed(false))
  }, [email])

  const subscribe = async () => {
    if (!email || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${BACKEND}/store/newsletter?account=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setSubscribed(true)
      } else {
        setError(data.error ?? "Eroare necunoscută")
      }
    } catch {
      setError("Eroare de rețea")
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async () => {
    if (!email || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${BACKEND}/store/newsletter`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setSubscribed(false)
      } else {
        setError(data.error ?? "Eroare necunoscută")
      }
    } catch {
      setError("Eroare de rețea")
    } finally {
      setLoading(false)
    }
  }

  if (!email || subscribed === null) return null

  return (
    <div className="border border-[var(--theme-border)] p-6 flex flex-col small:flex-row items-start small:items-center justify-between gap-4">
      <div>
        <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-1.5">
          Newsletter
        </p>
        <p className="font-display text-[18px] leading-tight text-[var(--theme-text)]">
          {subscribed ? (
            <>
              Ești abonat
              <span className="text-hunter-gold">.</span>
            </>
          ) : (
            "Nu ești abonat"
          )}
        </p>
        {subscribed && (
          <p className="font-sans text-[11px] text-[var(--theme-text-muted)] mt-1">
            Primești noutăți exclusive pe{" "}
            <span className="text-[var(--theme-text)]">{email}</span>
          </p>
        )}
        {!subscribed && (
          <p className="font-sans text-[11px] text-[var(--theme-text-muted)] mt-1">
            Abonează-te pentru oferte și noutăți exclusive.
          </p>
        )}
        {error && (
          <p className="font-sans text-[11px] text-red-400 mt-1">{error}</p>
        )}
      </div>

      <button
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={loading}
        className={
          subscribed
            ? "font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-current pb-0.5 disabled:opacity-40"
            : "font-sans text-[10px] uppercase tracking-[3px] text-hunter-dark bg-hunter-gold px-6 py-3 hover:bg-hunter-gold/90 transition-colors disabled:opacity-40"
        }
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin w-3.5 h-3.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            {subscribed ? "Dezabonare" : "Abonează-te"}
          </span>
        ) : subscribed ? (
          "Dezabonare"
        ) : (
          "Abonează-te"
        )}
      </button>
    </div>
  )
}
