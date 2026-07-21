"use client"

// Error boundary pentru rutele de checkout (inclusiv return-ul Netopia).
// Fără acest boundary, orice eroare client necaptată (ex. o cursă între
// redirect-ul extern și un refresh RSC pe mobil) golea complet aplicația cu
// pagina generică "a client-side exception has occurred". Aici o transformăm
// într-o stare recuperabilă — plata în sine e procesată server-to-server (IPN).
export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 text-center" style={{ minHeight: "calc(100vh - 64px)" }}>
      <h1 className="font-display text-2xl" style={{ color: "var(--theme-text)" }}>
        A apărut o eroare
      </h1>
      <p className="font-serif text-sm max-w-sm" style={{ color: "var(--theme-text-muted)" }}>
        Nu-ți face griji — dacă ai finalizat plata, comanda ta este în siguranță
        și vei primi un email de confirmare. Poți reîncerca sau reveni la coș.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="py-3 px-6 bg-hunter-gold text-[#0D0D0D] font-sans text-[10px] uppercase tracking-[4px] hover:opacity-90 transition-opacity"
        >
          Reîncearcă
        </button>
        <a
          href="/cart"
          className="font-sans text-[10px] uppercase tracking-[3px] hover:text-hunter-gold transition-colors"
          style={{ color: "var(--theme-text-muted)" }}
        >
          Înapoi la coș
        </a>
      </div>
    </div>
  )
}
