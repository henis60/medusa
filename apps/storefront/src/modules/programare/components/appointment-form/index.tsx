"use client"

import { useState } from "react"
import Script from "next/script"
import AppointmentTypeSelect from "@modules/programare/components/appointment-type-select"
import AppointmentDatePicker from "@modules/programare/components/appointment-date-picker"

const RECAPTCHA_SITEKEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "6LdnohktAAAAAOnmNaDbJ1bBeKx3irV5qgeqoOI5"

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

const Label = ({ htmlFor, children, error }: { htmlFor?: string; children: React.ReactNode; error?: boolean }) => (
  <label htmlFor={htmlFor} className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-2 flex items-center gap-1">
    {children}
    <span className={`text-base normal-case tracking-normal transition-colors ${error ? "text-red-400/80" : "text-hunter-gold/50"}`}>*</span>
  </label>
)

type Status = "idle" | "loading" | "success" | "error"
type Errors = Partial<Record<"name" | "email" | "phone" | "type" | "date" | "message", boolean>>

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export default function AppointmentForm() {
  const [status, setStatus] = useState<Status>("idle")
  const [errors, setErrors] = useState<Errors>({})

  const validate = (data: FormData): Errors => {
    const e: Errors = {}
    if (String(data.get("name") ?? "").trim().length < 2) e.name = true
    if (!validateEmail(String(data.get("email") ?? "").trim())) e.email = true
    if (!String(data.get("phone") ?? "").trim()) e.phone = true
    if (!String(data.get("type") ?? "").trim()) e.type = true
    if (!String(data.get("date") ?? "").trim()) e.date = true
    if (!String(data.get("message") ?? "").trim()) e.message = true
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
            .execute(RECAPTCHA_SITEKEY, { action: "appointment" })
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
            type: "appointment",
            recaptchaToken,
            message: [
              `Telefon: ${data.get("phone") || "—"}`,
              `Tip: ${data.get("type") || "—"}`,
              `Data: ${data.get("date") || "—"}${data.get("time") ? ` la ${data.get("time")}` : ""}`,
              "",
              data.get("message") || "",
            ].join("\n"),
          }),
        }
      )

      if (!res.ok) { setStatus("error"); return }
      setStatus("success")
      form.reset()
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="border border-[var(--theme-border)] min-h-[200px] p-8 text-center flex flex-col gap-3 justify-center">
        <p className="font-display text-2xl text-[var(--theme-text)]">Cerere trimisă!</p>
        <p className="font-sans text-sm text-[var(--theme-text-muted)]">
          Te contactăm în maximum 24 de ore pentru a confirma programarea.
        </p>
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
          <Label htmlFor="ap-name" error={errors.name}>Nume</Label>
          <input id="ap-name" name="name" type="text" className={inputClass(errors.name)} />
        </div>
        <div>
          <Label htmlFor="ap-email" error={errors.email}>Email</Label>
          <input id="ap-email" name="email" type="email" className={inputClass(errors.email)} />
        </div>
        <div>
          <Label htmlFor="ap-phone" error={errors.phone}>Telefon</Label>
          <input id="ap-phone" name="phone" type="tel" className={inputClass(errors.phone)} />
        </div>
        <AppointmentTypeSelect hasError={!!errors.type} />
      </div>

      <AppointmentDatePicker hasError={!!errors.date} />

      <div>
        <Label htmlFor="ap-message" error={errors.message}>Mesaj</Label>
        <textarea
          id="ap-message"
          name="message"
          rows={3}
          className={`w-full bg-transparent border px-3 py-3 font-sans text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none transition-colors resize-y ${
            errors.message ? "border-red-400/60" : "border-[var(--theme-border)] focus:border-hunter-gold/50"
          }`}
        />
      </div>

      {status === "error" && (
        <p className="font-sans text-xs text-red-400">
          Nu am putut trimite cererea. Încearcă din nou sau contactează-ne direct.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="self-start h-11 px-8 font-sans text-[10px] uppercase tracking-[3px] bg-hunter-gold text-hunter-dark hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === "loading" ? "Se trimite..." : "Trimite cererea"}
      </button>
      <p className="font-sans text-[9px] text-[var(--theme-text-muted)] opacity-50">
        Protejat de reCAPTCHA —{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Confidențialitate</a>
        {" "}·{" "}
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">Termeni</a>
      </p>
    </form>
    </>
  )
}
