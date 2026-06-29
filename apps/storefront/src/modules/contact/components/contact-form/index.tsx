"use client"

import { useState } from "react"
import Script from "next/script"

const RECAPTCHA_SITEKEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, opts: { action: string }) => Promise<string>
    }
  }
}

const inputClass = (err?: boolean) =>
  `w-full h-10 bg-transparent border px-3 font-sans text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none transition-colors ${
    err ? "border-red-400/60" : "border-[var(--theme-border)] focus:border-hunter-gold/50"
  }`

const Label = ({ htmlFor, children, error }: { htmlFor: string; children: React.ReactNode; error?: boolean }) => (
  <label htmlFor={htmlFor} className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-2 flex items-center gap-1">
    {children}
    <span className={`text-base normal-case tracking-normal transition-colors ${error ? "text-red-400/80" : "text-hunter-gold/50"}`}>*</span>
  </label>
)

type Status = "idle" | "loading" | "success" | "error"
type Errors = Partial<Record<"name" | "email" | "message", boolean>>

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle")
  const [errors, setErrors] = useState<Errors>({})

  const validate = (data: FormData): Errors => {
    const e: Errors = {}
    if (String(data.get("name") ?? "").trim().length < 2) e.name = true
    if (!validateEmail(String(data.get("email") ?? "").trim())) e.email = true
    if (String(data.get("message") ?? "").trim().length < 10) e.message = true
    return e
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    const errs = validate(data)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setErrors({})
    setStatus("loading")

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
            type: "contact",
            recaptchaToken,
          }),
        }
      )

      const json = await res.json()

      if (!res.ok) {
        setStatus("error")
        return
      }

      setStatus("success")
      form.reset()
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="border border-[var(--theme-border)] min-h-[200px] p-8 text-center flex flex-col gap-3 justify-center">
        <p className="font-display text-2xl text-[var(--theme-text)]">Îți mulțumim!</p>
        <p className="font-sans text-sm text-[var(--theme-text-muted)]">
          Mesajul tău a fost trimis. Revenim în maximum 24 de ore în zilele lucrătoare.
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
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" error={errors.name}>Nume</Label>
            <input id="name" name="name" type="text" className={inputClass(errors.name)} />
          </div>
          <div>
            <Label htmlFor="email" error={errors.email}>Email</Label>
            <input id="email" name="email" type="email" className={inputClass(errors.email)} />
          </div>
        </div>
        <div>
          <Label htmlFor="message" error={errors.message}>Mesaj</Label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className={`w-full bg-transparent border px-3 py-3 font-sans text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none transition-colors resize-y ${
              errors.message ? "border-red-400/60" : "border-[var(--theme-border)] focus:border-hunter-gold/50"
            }`}
          />
        </div>

        {status === "error" && (
          <p className="font-sans text-xs text-red-400">
            Nu am putut trimite mesajul. Verifică conexiunea și încearcă din nou.
          </p>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={status === "loading"}
            className="self-start h-11 px-8 font-sans text-[10px] uppercase tracking-[3px] bg-hunter-gold text-hunter-dark hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === "loading" ? "Se trimite..." : "Trimite mesajul"}
          </button>
          <p className="font-sans text-[9px] text-[var(--theme-text-muted)] leading-relaxed">
            Protejat de reCAPTCHA —{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-hunter-gold transition-colors">
              Confidențialitate
            </a>{" "}
            &amp;{" "}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-hunter-gold transition-colors">
              Termeni
            </a>
          </p>
        </div>
      </form>
    </>
  )
}
