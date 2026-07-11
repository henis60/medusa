import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { ThemeProvider } from "../providers/theme-provider"
import { FavoritesProvider } from "@lib/context/favorites-context"
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

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfairDisplay.variable} ${cormorantGaramond.variable} ${raleway.variable} ${cinzel.variable}`}
    >
      <body>
        <ThemeProvider>
          <FavoritesProvider>
            <main className="relative">{props.children}</main>
          </FavoritesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
