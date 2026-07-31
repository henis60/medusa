// This is the true root not-found route — rendered for any request that
// doesn't match a [locale] segment. No i18n context here, so use plain HTML.
export default function NotFound() {
  return (
    <html lang="ro">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 24px",
            gap: "16px",
            minHeight: "100vh",
          }}
        >
          <h1>Pagină negăsită</h1>
          <p>Se pare că te-ai rătăcit. Pagina căutată nu mai există sau și-a schimbat locul.</p>
          <a href="/" style={{ marginTop: "8px" }}>Înapoi la pagina principală</a>
        </div>
      </body>
    </html>
  )
}
