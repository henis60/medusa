// This is the true root not-found route — rendered for any request that
// doesn't match a [locale] segment (there's no root layout.tsx, so this file
// must supply its own <html>/<body>, same as global-error.tsx). Unlike that
// file, this one can safely import the global stylesheet and reuse
// NotFoundContent (like every other not-found.tsx in the app): globals.css
// defines `:root` light-theme CSS variables directly, with no dependency on
// ThemeProvider's runtime dark-mode toggle, so it renders correctly even
// this far outside the [locale] layout tree.
import "styles/globals.css"
import NotFoundContent from "@modules/common/components/not-found"

export default function NotFound() {
  return (
    <html lang="ro">
      <body>
        <NotFoundContent />
      </body>
    </html>
  )
}
