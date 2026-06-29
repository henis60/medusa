"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

const DAYS_LABEL = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"]
const MONTHS_RO = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
]

function firstDayOffset(year: number, month: number) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getSlots(date: Date): string[] {
  const day = date.getDay()
  if (day === 0) return []
  // Sesiuni de 1 oră — ultimul slot trebuie să se termine înainte de închidere
  // Luni–Vineri 07:00–18:00 → ultimul start 17:00
  // Sâmbătă 09:00–14:30 → ultimul start 13:00 (se termină la 14:00)
  const isWeekend = day === 6
  const startH = isWeekend ? 9 : 7
  const lastH = isWeekend ? 13 : 17
  const slots: string[] = []
  for (let h = startH; h <= lastH; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`)
  }
  return slots
}

const labelClass =
  "font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-2 block"

const inputBase =
  "w-full h-10 bg-transparent border border-[var(--theme-border)] px-3 font-sans text-sm focus:outline-none focus:border-hunter-gold/50 transition-colors"

export default function AppointmentDatePicker() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  const handleToggle = () => {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setOpenUp(window.innerHeight - rect.bottom < 400)
    }
    setOpen((o) => !o)
  }

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [])

  const offset = firstDayOffset(viewYear, viewMonth)
  const days = daysInMonth(viewYear, viewMonth)
  const slots = selectedDate ? getSlots(selectedDate) : []

  const displayValue = selectedDate
    ? `${String(selectedDate.getDate()).padStart(2, "0")}.${String(selectedDate.getMonth() + 1).padStart(2, "0")}.${selectedDate.getFullYear()}${selectedTime ? ` · ${selectedTime}` : ""}`
    : ""

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const selectDay = (day: number) => {
    setSelectedDate(new Date(viewYear, viewMonth, day))
    setSelectedTime("")
  }

  const isDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day)
    return d < today || d.getDay() === 0
  }

  const isSelected = (day: number) =>
    !!selectedDate &&
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getDate() === day

  const isToday = (day: number) =>
    new Date(viewYear, viewMonth, day).getTime() === today.getTime()

  const hiddenDate = selectedDate
    ? `${String(selectedDate.getDate()).padStart(2, "0")}.${String(selectedDate.getMonth() + 1).padStart(2, "0")}.${selectedDate.getFullYear()}`
    : ""

  return (
    <div ref={containerRef} className="relative">
      <label className={labelClass}>Data și ora</label>
      <input type="hidden" name="date" value={hiddenDate} />
      <input type="hidden" name="time" value={selectedTime} />

      <button
        type="button"
        onClick={handleToggle}
        className={`${inputBase} flex items-center justify-between cursor-pointer text-left`}
      >
        <span className={displayValue ? "text-[var(--theme-text)]" : "text-[var(--theme-text-muted)]"}>
          {displayValue || "Alege data și ora"}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--theme-text-muted)] shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className={`absolute left-0 z-30 bg-[var(--theme-bg)] border border-[var(--theme-border)] shadow-xl w-[300px] ${openUp ? "bottom-full mb-1" : "top-full mt-1"}`}
          >
            {/* Month nav */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--theme-border)]">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span className="font-sans text-[11px] uppercase tracking-[3px] text-[var(--theme-text)]">
                {MONTHS_RO[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Calendar grid */}
            <div className="px-3 pt-3 pb-2">
              <div className="grid grid-cols-7 mb-1.5">
                {DAYS_LABEL.map((d) => (
                  <div key={d} className="text-center font-sans text-[9px] uppercase tracking-[1px] text-[var(--theme-text-muted)] py-1">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
                  const disabled = isDisabled(day)
                  const selected = isSelected(day)
                  const tod = isToday(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={disabled}
                      onClick={() => selectDay(day)}
                      className={[
                        "h-8 w-full font-sans text-[12px] transition-colors rounded-none",
                        disabled
                          ? "text-[var(--theme-text-muted)] opacity-25 cursor-not-allowed"
                          : "hover:bg-[var(--theme-surface)] cursor-pointer text-[var(--theme-text)]",
                        selected
                          ? "!bg-hunter-gold !text-hunter-dark font-medium"
                          : "",
                        tod && !selected
                          ? "underline decoration-hunter-gold decoration-1 underline-offset-2"
                          : "",
                      ].join(" ")}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            <AnimatePresence>
              {selectedDate && slots.length > 0 && (
                <motion.div
                  key="slots"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-3 border-t border-[var(--theme-border)]">
                    <p className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-2">
                      Ora
                    </p>
                    <div className="grid grid-cols-5 gap-1">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => { setSelectedTime(slot); setOpen(false) }}
                          className={[
                            "h-7 font-sans text-[10px] border transition-colors",
                            selectedTime === slot
                              ? "border-hunter-gold bg-hunter-gold text-hunter-dark"
                              : "border-[var(--theme-border)] text-[var(--theme-text)] hover:border-hunter-gold/60",
                          ].join(" ")}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selectedDate && slots.length === 0 && (
                <motion.div
                  key="closed"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                <div className="px-4 py-3 border-t border-[var(--theme-border)]">
                <p className="font-sans text-[10px] text-[var(--theme-text-muted)]">
                  Duminica suntem închiși. Alege altă zi.
                </p>
                </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
