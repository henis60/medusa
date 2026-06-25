"use client"

import { useState } from "react"

type Status = "idle" | "loading" | "success" | "error"

export default function NewsletterForm() {
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    const email = new FormData(e.currentTarget).get("email") as string

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/newsletter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
          },
          body: JSON.stringify({ email }),
        }
      )

      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error || "A apărut o eroare.")
        setStatus("error")
        return
      }

      setStatus("success")
    } catch {
      setErrorMsg("Abonarea a eșuat. Încearcă din nou.")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <p className="font-sans text-[10px] uppercase tracking-[3px] text-hunter-gold">
        Abonare confirmată!
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)]">
        Newsletter
      </p>
      <form onSubmit={handleSubmit} className="flex gap-0">
        <input
          name="email"
          type="email"
          required
          placeholder="adresa@email.ro"
          className="h-9 flex-1 min-w-0 bg-transparent border border-[var(--theme-border)] border-r-0 px-3 font-sans text-xs text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-hunter-gold/50 transition-colors"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="h-9 px-4 font-sans text-[9px] uppercase tracking-[3px] bg-hunter-gold text-hunter-dark hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
        >
          {status === "loading" ? "..." : "Abonează-te"}
        </button>
      </form>
      {status === "error" && (
        <p className="font-sans text-[10px] text-red-400">{errorMsg}</p>
      )}
    </div>
  )
}
