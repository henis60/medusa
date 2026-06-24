"use client"

import { useState } from "react"

const inputClass =
  "w-full h-10 bg-transparent border border-[var(--theme-border)] px-3 font-sans text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-hunter-gold/50 transition-colors"

const labelClass =
  "font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-2 block"

export default function ContactForm() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = (data.get("name") as string)?.trim() || ""
    const email = (data.get("email") as string)?.trim() || ""
    const message = (data.get("message") as string)?.trim() || ""

    // Fallback fără backend: deschide clientul de email cu mesajul precompletat.
    const body = `Nume: ${name}\nEmail: ${email}\n\n${message}`
    window.location.href = `mailto:contact@thehunter.ro?subject=${encodeURIComponent(
      "Mesaj de pe site"
    )}&body=${encodeURIComponent(body)}`

    setSent(true)
  }

  if (sent) {
    return (
      <div className="border border-[var(--theme-border)] p-8 text-center flex flex-col gap-3">
        <p className="font-display text-2xl text-[var(--theme-text)]">
          Îți mulțumim!
        </p>
        <p className="font-sans text-sm text-[var(--theme-text-muted)]">
          Mesajul tău a fost pregătit pentru trimitere. Revenim în maximum 24 de
          ore în zilele lucrătoare.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-2 self-center font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-current pb-0.5"
        >
          Trimite alt mesaj
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Nume
          </label>
          <input id="name" name="name" type="text" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input id="email" name="email" type="email" required className={inputClass} />
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
          rows={4}
          className="w-full bg-transparent border border-[var(--theme-border)] px-3 py-3 font-sans text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-hunter-gold/50 transition-colors resize-y"
        />
      </div>
      <button
        type="submit"
        className="self-start h-11 px-8 font-sans text-[10px] uppercase tracking-[3px] bg-hunter-gold text-hunter-dark hover:opacity-90 transition-opacity"
      >
        Trimite mesajul
      </button>
    </form>
  )
}
