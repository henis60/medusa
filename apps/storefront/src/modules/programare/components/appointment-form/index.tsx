"use client"

import { useState } from "react"
import AppointmentTypeSelect from "@modules/programare/components/appointment-type-select"
import AppointmentDatePicker from "@modules/programare/components/appointment-date-picker"

const inputClass =
  "w-full h-10 bg-transparent border border-[var(--theme-border)] px-3 font-sans text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-hunter-gold/50 transition-colors"

const labelClass =
  "font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-2 block"

type Status = "idle" | "loading" | "success" | "error"

export default function AppointmentForm() {
  const [status, setStatus] = useState<Status>("idle")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("loading")

    const form = e.currentTarget
    const data = new FormData(form)

    try {
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
            message: [
              "[PROGRAMARE]",
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
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 self-center font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-current pb-0.5"
        >
          Altă programare
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ap-name" className={labelClass}>Nume</label>
          <input id="ap-name" name="name" type="text" required minLength={2} className={inputClass} />
        </div>
        <div>
          <label htmlFor="ap-email" className={labelClass}>Email</label>
          <input id="ap-email" name="email" type="email" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="ap-phone" className={labelClass}>Telefon</label>
          <input id="ap-phone" name="phone" type="tel" className={inputClass} />
        </div>
        <AppointmentTypeSelect />
      </div>

      <AppointmentDatePicker />

      <div>
        <label htmlFor="ap-message" className={labelClass}>Mesaj (opțional)</label>
        <textarea
          id="ap-message"
          name="message"
          rows={3}
          className="w-full bg-transparent border border-[var(--theme-border)] px-3 py-3 font-sans text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-hunter-gold/50 transition-colors resize-y"
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
    </form>
  )
}
