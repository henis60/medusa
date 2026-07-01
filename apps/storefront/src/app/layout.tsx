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

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
})

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-raleway",
  display: "swap",
})

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
    apple: "/favicon.svg",
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
