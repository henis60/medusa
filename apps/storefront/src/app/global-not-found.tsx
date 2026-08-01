// This app has no single root layout — app/[locale]/layout.tsx is a
// top-level dynamic-segment layout, so there's nothing to compose a global
// 404 out of for URLs that don't even match [locale]. This is precisely the
// case Next's docs cite as the reason global-not-found.js exists (see
// experimental.globalNotFound in next.config.js). It bypasses the app's
// normal rendering entirely and must supply its own full <html>/<body>
// document, no global styles/fonts included unless imported here.
//
// Kept deliberately free of client components: the previous ad hoc
// app/not-found.tsx handled this same "no root layout" case by hand-writing
// <html>/<body> itself, and nesting a client component in there (a
// back-to-home button using useRouter) caused a production-only React
// hydration crash (minified error #310). Since this file is rendered the
// same way — its own document, no ancestor layout — the same risk applies;
// a plain <a> avoids it entirely.
export default function GlobalNotFound() {
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
