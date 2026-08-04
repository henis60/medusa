// This is the true root not-found route — rendered for any request that
// doesn't match a [locale] segment (there's no root layout.tsx, so this file
// must supply its own <html>/<body>). It can still reuse NotFoundContent
// (like every other not-found.tsx in the app): globals.css defines `:root`
// light-theme CSS variables directly, with no dependency on ThemeProvider's
// runtime dark-mode toggle, so it renders correctly even this far outside
// the [locale] layout tree. NotFoundContent's own back-home link (next-intl's
// Link) has no NextIntlClientProvider here to read from, so it may not
// navigate in this specific rare fallback case — a previous attempt to swap
// it for a client-side router.push button crashed in production (React
// hydration error #310, since this file has no root layout above it), so
// don't repeat that; leave the Link as-is.
import "styles/globals.css"
import NotFoundContent from "@modules/common/components/not-found"

// next-intl's build plugin (next.config.js's withNextIntl) wraps every
// server-rendered page app-wide — including this one, despite it having
// nothing to do with [locale] — so getRequestConfig's `requestLocale` still
// resolves here, and that internally reads cookies/headers. Next.js tries
// to statically prerender this route at build time (nothing here looks
// dynamic from its own code), then hits that headers() read at actual
// request time and throws "Page changed from static to dynamic at runtime"
// — Next.js doesn't support flipping rendering mode after the fact. Forcing
// dynamic up front avoids the mismatch instead of fighting it.
export const dynamic = "force-dynamic"

export default function NotFound() {
  return (
    <html lang="ro">
      <body>
        <NotFoundContent />
      </body>
    </html>
  )
}
