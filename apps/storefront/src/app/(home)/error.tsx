"use client"

// Error boundary pentru grupul (home) — vezi (main)/error.tsx pentru context.
export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <h1 className="font-display text-2xl" style={{ color: "var(--theme-text)" }}>
        A apărut o eroare
      </h1>
      <p className="font-serif text-sm max-w-sm" style={{ color: "var(--theme-text-muted)" }}>
        Ceva nu a funcționat cum trebuie. Poți reîncerca sau reveni la pagina
        principală.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="py-3 px-6 bg-hunter-gold text-[#0D0D0D] font-sans text-[10px] uppercase tracking-[4px] hover:opacity-90 transition-opacity"
        >
          Reîncearcă
        </button>
        <a
          href="/"
          className="font-sans text-[10px] uppercase tracking-[3px] hover:text-hunter-gold transition-colors"
          style={{ color: "var(--theme-text-muted)" }}
        >
          Pagina principală
        </a>
      </div>
    </div>
  )
}
