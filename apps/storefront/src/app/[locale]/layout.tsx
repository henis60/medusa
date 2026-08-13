import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import "leaflet/dist/leaflet.css"
import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { routing } from "@i18n/routing"
import { setRequestLocaleValue } from "@lib/util/request-locale"
import { serializeJsonLd } from "@lib/util/json-ld"
import { ThemeProvider } from "../../providers/theme-provider"
import { FavoritesProvider } from "@lib/context/favorites-context"
import { ConsentProvider } from "@lib/context/consent-context"
import CookieConsent from "@modules/common/components/cookie-consent"
import GoogleAnalytics from "@modules/common/components/google-analytics"
import ChunkErrorGuard from "@modules/common/components/chunk-error-guard"
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
  title: {
    default: "The Hunter House — Return of the Elegant Gentleman",
    // Pages that only set a plain string title (e.g. "Contact") get this
    // suffix automatically; pages building their own full "X | Brand"
    // string (product/category pages) aren't affected — the template only
    // applies when a page's title is a bare string, not when it already
    // contains the brand.
    template: "%s | The Hunter House",
  },
  description:
    "Tailoring premium, The Hunter Bar și o comunitate exclusivă, reunite într-un spațiu unic în România.",
  icons: {
    icon: [
      { url: "/favicon.svg", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.svg", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/apple-touch-icon.png",
  },
  // Site-wide defaults — individual pages (e.g. product) override title/
  // description/images but inherit siteName/locale/card from here unless
  // they set their own.
  openGraph: {
    siteName: "The Hunter House",
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
}

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: "The Hunter House",
  legalName: "S.C. BOJO HOUSE S.R.L.",
  url: getBaseURL(),
  telephone: "+40765080667",
  email: "contact@thehunter.ro",
  // The physical/visitable store — used here for local SEO (this is what
  // should surface for "Baia Mare" area searches and Google Maps matching).
  // The company's registered legal address (Târgu Lăpuș) is a compliance
  // disclosure, not an SEO signal — it belongs on the legal pages
  // (terms-of-use, privacy-policy, relatii-clienti), not in structured data.
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bulevardul Unirii 7",
    addressLocality: "Baia Mare",
    addressRegion: "Maramureș",
    addressCountry: "RO",
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
      <head>
        {/* Warms the DNS + TLS connection to the image host before the
            first <img>/next/image request fires, shaving that handshake
            off the critical path for the very first paint of any page. */}
        <link rel="preconnect" href="https://media.thehunter.ro" />
        <link rel="dns-prefetch" href="https://media.thehunter.ro" />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(ORGANIZATION_JSON_LD),
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ChunkErrorGuard />
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
