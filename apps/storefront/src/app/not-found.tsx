// This is the true root not-found route — Next.js renders it for any
// request that doesn't match a [locale] segment at all, so it sits outside
// [locale]/layout.tsx's NextIntlClientProvider. NotFoundContent's Link (from
// next-intl) needs that provider to resolve a locale; without it, it throws
// client-side. Use a plain anchor here instead of pulling in NotFoundContent.
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
          <a href="/">Înapoi la pagina principală</a>
        </div>
      </body>
    </html>
  )
}
