// This is the true root not-found route — rendered for any request that
// doesn't match a [locale] segment. There's no root layout.tsx, so this file
// must render its own <html>/<body> (same constraint as global-error.tsx).
// That means NO client components can be nested inside it: hydrating a
// client component (e.g. NotFoundContent's back-home button, which uses
// useRouter) in an <html>/<body> with no root layout above it produced a
// production-only React hydration crash (minified error #310) — confirmed
// by reverting to plain static HTML, same as this file had before
// NotFoundContent was (incorrectly) reused here. The other not-found.tsx
// files in the app render inside the real [locale] layout tree and don't
// have this problem — only this root one is special.
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
