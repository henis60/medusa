import "./globals.css";
import {
  Cinzel,
  Cormorant_Garamond,
  Playfair_Display,
  Raleway,
} from "next/font/google";

const playfairDisplay = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin", "latin-ext"],
  variable: "--font-raleway",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin", "latin-ext"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://thehunter.ro"),
  title: "The Hunter House - Return of the Elegant Gentleman",
  description:
    "The Hunter House - Return of the Elegant Gentleman. Tailoring premium, The Hunter Bar și o comunitate exclusivă, reunite într-un spațiu unic în România.",
  icons: {
    icon: "/images/favicon-dark.svg",
    apple: "/images/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#152018",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ro"
      className={`${playfairDisplay.variable} ${cormorantGaramond.variable} ${raleway.variable} ${cinzel.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
