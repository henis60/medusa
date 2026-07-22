"use client"

// Plasă de siguranță finală: prinde erori aruncate chiar din RootLayout
// (providers, fonturi etc.), unde (main)/error.tsx nu ajunge să se monteze.
// Next.js cere ca acest fișier să randeze propriile <html>/<body> — nu ne
// putem baza pe CSS vars din ThemeProvider, deci culorile sunt hardcodate.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0D0D0D" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            padding: "1.5rem",
            textAlign: "center",
            minHeight: "100vh",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ color: "#F5F1E8", fontSize: "1.5rem", margin: 0 }}>
            A apărut o eroare
          </h1>
          <p style={{ color: "#A39C8E", fontSize: "0.9rem", maxWidth: "24rem", margin: 0 }}>
            Ceva nu a funcționat cum trebuie. Poți reîncerca sau reveni la
            pagina principală.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={reset}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#c9a84c",
                color: "#0D0D0D",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "4px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Reîncearcă
            </button>
            <a
              href="/"
              style={{
                color: "#A39C8E",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "3px",
                textDecoration: "none",
              }}
            >
              Pagina principală
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
