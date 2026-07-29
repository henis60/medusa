import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { routing } from "@i18n/routing"
import { setRequestLocaleValue } from "@lib/util/request-locale"
import { ThemeProvider } from "../../providers/theme-provider"
import { FavoritesProvider } from "@lib/context/favorites-context"
import { ConsentProvider } from "@lib/context/consent-context"
import CookieConsent from "@modules/common/components/cookie-consent"
import GoogleAnalytics from "@modules/common/components/google-analytics"
import {
  Cinzel,
  Cormorant_Garamond,
  Playfair_Display,
  Raleway,
} from "next/font/google"

// All four families are Google variable fonts: omitting `weight` loads ONE
// file per style covering every weight — fewer/lighter downloads than the
// previous per-weight static files. `latin-ext` is required for Romanian
// diacritics (ș, ț, ă live there; plain `latin` made them fall back to
// system fonts).
const playfairDisplay = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
})

const raleway = Raleway({
  subsets: ["latin", "latin-ext"],
  variable: "--font-raleway",
  display: "swap",
})

const cinzel = Cinzel({
  subsets: ["latin", "latin-ext"],
  variable: "--font-cinzel",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  icons: {
    icon: [
      { url: "/favicon.svg", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.svg", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/apple-touch-icon.png",
  },
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  // Enables static rendering for this locale — must be called before any
  // next-intl hook/function is used in this render tree.
  setRequestLocale(locale)

  // Separate from next-intl's own request-locale mechanism: this is a plain
  // React cache()-scoped value (see request-locale.ts) used by the
  // translation overlay, which needs a locale source that's immune to the
  // AsyncLocalStorage-propagation issue affecting cookies()/headers() (and
  // next-intl's getLocale()) under concurrent Promise.all fan-outs.
  setRequestLocaleValue(locale)

  const messages = await getMessages()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${playfairDisplay.variable} ${cormorantGaramond.variable} ${raleway.variable} ${cinzel.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <GoogleAnalytics />
          <ThemeProvider>
            <ConsentProvider>
              <FavoritesProvider>
                <main className="relative">{children}</main>
                <CookieConsent />
              </FavoritesProvider>
            </ConsentProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
