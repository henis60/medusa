import { Metadata } from "next"

import MeridianTemplate from "@modules/meridian/templates"

const TITLE = "The Hunter Meridian — Ediția I, 26 septembrie 2026"
const DESCRIPTION =
  "Zece automobile, concert Jazz & Blues cu Gray Bliss Band și invitatul special Mihail, artă și colecții noi. 26 septembrie 2026, Baia Mare."
const OG_DESCRIPTION =
  "26 septembrie 2026, Baia Mare. O zi de automobile de colecție, blues & jazz, artă și Made to Measure."
const URL = "https://thehunter.ro/meridian"
// Brand lockup used as the social-share card, at the standard 1.91:1 OG
// ratio so Facebook/X/WhatsApp display it uncropped.
const IMAGE = "https://thehunter.ro/meridian/thm-og.png"
const IMAGE_W = 1200
const IMAGE_H = 630
const IMAGE_ALT = "The Hunter Meridian"

export const metadata: Metadata = {
  // .absolute bypasses the root layout's "%s | The Hunter House" template —
  // this string is already the full title, brand included.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "The Hunter Meridian",
    "eveniment auto Baia Mare",
    "automobile de colecție România",
    "Lamborghini Centenario Tractor",
    "eveniment Baia Mare Maramureș",
    "concert Jazz & Blues Gray Bliss Band Cluj-Napoca",
    "Mihail invitat special",
    "eveniment lifestyle Maramureș",
    "The Hunter House",
    "made to measure",
    "septembrie 2026",
  ],
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: "The Hunter Meridian",
    title: TITLE,
    description: OG_DESCRIPTION,
    url: URL,
    images: [
      {
        url: IMAGE,
        width: IMAGE_W,
        height: IMAGE_H,
        alt: IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: OG_DESCRIPTION,
    images: [IMAGE],
  },
  robots: { index: true, follow: true },
}

// Event structured data — lets Google show the date, venue and ticket link
// directly in results / the events carousel.
const eventSchema = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "The Hunter Meridian — Ediția I",
  description: DESCRIPTION,
  startDate: "2026-09-26T11:00:00+03:00",
  endDate: "2026-09-26T23:00:00+03:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  image: [IMAGE],
  url: URL,
  location: {
    "@type": "Place",
    name: "Baia Mare",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Baia Mare",
      addressRegion: "Maramureș",
      addressCountry: "RO",
    },
  },
  organizer: {
    "@type": "Organization",
    name: "The Hunter Meridian",
    url: URL,
  },
  isAccessibleForFree: true,
  performer: {
    "@type": "Organization",
    name: "The Hunter Meridian",
  },
}

export default function MeridianPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <MeridianTemplate />
    </>
  )
}
