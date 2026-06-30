"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Script from "next/script"
import AppointmentTypeSelect from "@modules/programare/components/appointment-type-select"
import AppointmentDatePicker from "@modules/programare/components/appointment-date-picker"

const RECAPTCHA_SITEKEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "6LdnohktAAAAAOnmNaDbJ1bBeKx3irV5qgeqoOI5"

declare global {
  interface Window {
    grecaptcha: { ready: (cb: () => void) => void; execute: (k: string, o: { action: string }) => Promise<string> }
  }
}

const inputClass = (err?: boolean) =>
  `w-full h-10 bg-transparent border px-3 font-sans text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none transition-colors ${
    err ? "border-red-400/60" : "border-gray-200 focus:border-hunter-gold/60"
  }`

const labelClass = "font-sans text-[9px] uppercase tracking-[3px] text-gray-400 mb-2 flex items-center gap-1"

const Label = ({ htmlFor, children, error }: { htmlFor?: string; children: React.ReactNode; error?: boolean }) => (
  <label htmlFor={htmlFor} className={labelClass}>
    {children}
    <span className={`text-sm normal-case tracking-normal transition-colors ${error ? "text-red-400/80" : "text-hunter-gold/50"}`}>*</span>
  </label>
)

const STEPS = ["Tip", "Data & Ora", "Contact"]

const slide = (dir: number) => ({
  initial: { opacity: 0, x: dir * 32 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: dir * -32 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
})

type Status = "idle" | "loading" | "success" | "error"

export default function AppointmentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)
  const [status, setStatus] = useState<Status>("idle")

  const [apptType, setApptType] = useState("")
  const [typeError, setTypeError] = useState(false)

  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [dateError, setDateError] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  const reset = () => {
    setStep(1); setDir(1); setStatus("idle")
    setApptType(""); setTypeError(false)
    setDate(""); setTime(""); setDateError(false)
    setName(""); setEmail(""); setPhone(""); setMessage("")
    setErrors({})
  }

  const handleClose = () => { reset(); onClose() }

  const goTo = (next: number) => { setDir(next > step ? 1 : -1); setStep(next) }

  const nextStep = () => {
    if (step === 1) {
      if (!apptType) { setTypeError(true); return }
      setTypeError(false); goTo(2)
    } else if (step === 2) {
      if (!date) { setDateError(true); return }
      setDateError(false); goTo(3)
    }
  }

  const handleSubmit = async () => {
    const e: Record<string, boolean> = {}
    if (name.trim().length < 2) e.name = true
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = true
    if (!phone.trim()) e.phone = true
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({}); setStatus("loading")

    try {
      const recaptchaToken = await new Promise<string>((resolve, reject) => {
        window.grecaptcha.ready(() =>
          window.grecaptcha.execute(RECAPTCHA_SITEKEY, { action: "appointment" }).then(resolve).catch(reject)
        )
      })

      const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
        },
        body: JSON.stringify({
          name, email, type: "appointment", recaptchaToken,
          message: [
            `Telefon: ${phone || "—"}`,
            `Tip: ${apptType || "—"}`,
            `Data: ${date || "—"}${time ? ` la ${time}` : ""}`,
            "", message,
          ].join("\n"),
        }),
      })

      if (!res.ok) { setStatus("error"); return }
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Script src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITEKEY}`} strategy="lazyOnload" />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

          {/* Panel */}
          <motion.div
            className="relative z-10 w-full max-w-md bg-white"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div>
                <p className="font-sans text-[9px] uppercase tracking-[3px] text-hunter-gold/70 mb-0.5">Programare</p>
                <h2 className="font-display text-lg text-gray-900">Rezervă o vizită</h2>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                aria-label="Închide"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Step indicator */}
            {status !== "success" && (
              <div className="flex border-b border-gray-100">
                {STEPS.map((label, i) => {
                  const n = i + 1
                  const active = step === n
                  const done = step > n
                  return (
                    <div
                      key={n}
                      onClick={() => done && goTo(n)}
                      className={`flex-1 flex flex-row items-center justify-center gap-1.5 py-3 border-b-2 transition-colors ${
                        active ? "border-hunter-gold" : done ? "border-hunter-gold/30 cursor-pointer hover:border-hunter-gold/60" : "border-transparent"
                      }`}
                    >
                      <span className={`font-sans text-[9px] uppercase tracking-[2px] transition-colors ${active ? "text-gray-700" : done ? "text-gray-400" : "text-gray-300"}`}>
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-5 min-h-[460px]">
              <AnimatePresence mode="wait" initial={false}>
                {status === "success" ? (
                  <motion.div key="success" {...slide(1)} className="text-center py-6 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-hunter-gold/40 flex items-center justify-center mb-2">
                      <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                        <path d="M1 6L6 11L15 1" stroke="rgba(201,168,76,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="font-display text-xl text-gray-900">Cerere trimisă!</p>
                    <p className="font-sans text-sm text-gray-500">
                      Te contactăm în maximum 24 de ore pentru a confirma programarea.
                    </p>
                    <button
                      onClick={handleClose}
                      className="mt-2 font-sans text-[9px] uppercase tracking-[3px] text-gray-400 hover:text-hunter-gold transition-colors border-b border-current pb-0.5 cursor-pointer"
                    >
                      Închide
                    </button>
                  </motion.div>

                ) : step === 1 ? (
                  <motion.div key="step1" {...slide(dir)}>
                    <AppointmentTypeSelect hasError={typeError} onSelect={(v) => { setApptType(v); setTypeError(false) }} />
                  </motion.div>

                ) : step === 2 ? (
                  <motion.div key="step2" {...slide(dir)}>
                    <AppointmentDatePicker
                      hasError={dateError}
                      onSelect={(d, t) => { setDate(d); setTime(t); setDateError(false) }}
                    />
                  </motion.div>

                ) : (
                  <motion.div key="step3" {...slide(dir)} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-3">
                      <div>
                        <Label htmlFor="m-name" error={errors.name}>Nume</Label>
                        <input id="m-name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass(errors.name)} />
                      </div>
                      <div>
                        <Label htmlFor="m-email" error={errors.email}>Email</Label>
                        <input id="m-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass(errors.email)} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="m-phone" error={errors.phone}>Telefon</Label>
                      <input id="m-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass(errors.phone)} />
                    </div>
                    <div>
                      <label htmlFor="m-message" className="font-sans text-[9px] uppercase tracking-[3px] text-gray-400 mb-2 flex items-center gap-1">
                        Mesaj
                        <span className="text-sm normal-case tracking-normal text-hunter-gold/50">*</span>
                      </label>
                      <textarea
                        id="m-message" rows={3} value={message}
                        onChange={e => setMessage(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 px-3 py-2.5 font-sans text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-hunter-gold/60 transition-colors resize-none"
                      />
                    </div>
                    {status === "error" && (
                      <p className="font-sans text-xs text-red-400">Nu am putut trimite cererea. Încearcă din nou.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer nav */}
            {status !== "success" && (
              <div className="flex items-center justify-between px-6 pb-5">
                <button
                  onClick={() => goTo(step - 1)}
                  className={`font-sans text-[9px] uppercase tracking-[3px] text-gray-400 hover:text-gray-700 transition-colors cursor-pointer ${step === 1 ? "invisible" : ""}`}
                >
                  Înapoi
                </button>
                {step < 3 ? (
                  <button
                    onClick={nextStep}
                    className="h-9 px-6 font-sans text-[9px] uppercase tracking-[3px] bg-hunter-gold text-hunter-dark hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Continuă
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={status === "loading"}
                    className="h-9 px-6 font-sans text-[9px] uppercase tracking-[3px] bg-hunter-gold text-hunter-dark hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    {status === "loading" ? "Se trimite..." : "Trimite cererea"}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
