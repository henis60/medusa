"use client"

import { useConsent } from "@lib/context/consent-context"

export default function CookieSettings() {
  const { consent, loaded, accept, reject } = useConsent()

  const hasChoice = loaded && consent !== null
  const status = consent === "granted" ? "acceptate" : "doar necesare"

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      {hasChoice && (
        <span className="text-sm text-[var(--theme-text-muted)]">
          Preferința ta actuală:{" "}
          <span className="text-[var(--theme-text)]">{status}</span>
        </span>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reject}
          className="h-11 rounded-none border border-[var(--theme-border)] bg-transparent px-6 font-sans text-[11px] uppercase tracking-[3px] text-[var(--theme-text)] transition-colors hover:border-[var(--theme-text)]"
        >
          Doar necesare
        </button>
        <button
          type="button"
          onClick={accept}
          className="h-11 rounded-none bg-hunter-gold px-6 font-sans text-[11px] uppercase tracking-[3px] text-hunter-dark transition-colors hover:bg-hunter-gold-b"
        >
          Accept toate
        </button>
      </div>
    </div>
  )
}
