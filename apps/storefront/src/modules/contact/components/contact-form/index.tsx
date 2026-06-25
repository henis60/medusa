"use client"

import { useState } from "react"
import Script from "next/script"

const RECAPTCHA_SITEKEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "6LdnohktAAAAAOnmNaDbJ1bBeKx3irV5qgeqoOI5"

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, opts: { action: string }) => Promise<string>
    }
  }
}

const inputClass =
  "w-full h-10 bg-transparent border border-[var(--theme-border)] px-3 font-sans text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-hunter-gold/50 transition-colors"

const labelClass =
  "font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-2 block"

type Status = "idle" | "loading" | "success" | "error"

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const recaptchaToken = await new Promise<string>((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(RECAPTCHA_SITEKEY, { action: "contact" })
            .then(resolve)
            .catch(reject)
        })
      })

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
          },
          body: JSON.stringify({
            name: data.get("name"),
            email: data.get("email"),
            message: data.get("message"),
            recaptchaToken,
          }),
        }
      )

      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error || "A apărut o eroare. Încearcă din nou.")
        setStatus("error")
        return
      }

      setStatus("success")
      form.reset()
    } catch {
      setErrorMsg("Nu am putut trimite mesajul. Verifică conexiunea și încearcă din nou.")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="border border-[var(--theme-border)] min-h-[200px] p-8 text-center flex flex-col gap-3 justify-center">
        <p className="font-display text-2xl text-[var(--theme-text)]">
          Îți mulțumim!
        </p>
        <p className="font-sans text-sm text-[var(--theme-text-muted)]">
          Mesajul tău a fost trimis. Revenim în maximum 24 de ore în zilele
          lucrătoare.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 self-center font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-current pb-0.5"
        >
          Trimite alt mesaj
        </button>
      </div>
    )
  }

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITEKEY}`}
        strategy="lazyOnload"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className={labelClass}>
              Nume
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="message" className={labelClass}>
            Mesaj
          </label>
          <textarea
            id="message"
            name="message"
            required
            minLength={10}
            rows={4}
            className="w-full bg-transparent border border-[var(--theme-border)] px-3 py-3 font-sans text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-hunter-gold/50 transition-colors resize-y"
          />
        </div>

        {status === "error" && (
          <p className="font-sans text-xs text-red-400">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="self-start h-11 px-8 font-sans text-[10px] uppercase tracking-[3px] bg-hunter-gold text-hunter-dark hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {status === "loading" ? "Se trimite..." : "Trimite mesajul"}
        </button>
      </form>
    </>
  )
}
