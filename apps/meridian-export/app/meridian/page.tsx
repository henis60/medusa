import type { Metadata } from "next";

import MeridianTemplate from "../../components/meridian-template";

const SITE_URL = "https://thehunter.ro";
const TITLE = "The Hunter Meridian — Ediția I, 26 septembrie 2026";
const DESCRIPTION =
  "Zece automobile în cinci perechi clasic–contemporan, cu Lamborghini Centenario Tractor în premieră în România, concert Mihail și Gray Bliss Band din Cluj-Napoca, expoziție de pictură și sculptură și trei colecții noi The Hunter House. 26 septembrie 2026, Colonia Pictorilor, Baia Mare.";
const OG_DESCRIPTION =
  "26 septembrie 2026, Colonia Pictorilor, Baia Mare. O zi de automobile de colecție, blues & jazz, artă și Made to Measure.";
const PAGE_URL = `${SITE_URL}/meridian`;
// Brand lockup used as the social-share card, at the standard 1.91:1 OG
// ratio so Facebook/X/WhatsApp display it uncropped.
const IMAGE = `${SITE_URL}/meridian/thm-og.png`;
const IMAGE_W = 1200;
const IMAGE_H = 630;
const IMAGE_ALT = "The Hunter Meridian";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "The Hunter Meridian",
    "eveniment auto Baia Mare",
    "automobile de colecție România",
    "Lamborghini Centenario Tractor",
    "Colonia Pictorilor Baia Mare",
    "concert Mihail și Gray Bliss Band din Cluj-Napoca",
    "eveniment lifestyle Maramureș",
    "The Hunter House",
    "made to measure",
    "septembrie 2026",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: "The Hunter House",
    title: TITLE,
    description: OG_DESCRIPTION,
    url: PAGE_URL,
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
};

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
  url: PAGE_URL,
  location: {
    "@type": "Place",
    name: "Colonia Pictorilor",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Baia Mare",
      addressRegion: "Maramureș",
      addressCountry: "RO",
    },
  },
  organizer: {
    "@type": "Organization",
    name: "The Hunter House",
    url: `${SITE_URL}/`,
  },
  offers: [
    {
      "@type": "Offer",
      name: "Pre Sale",
      price: "100",
      priceCurrency: "RON",
      availability: "https://schema.org/InStock",
      url: "https://www.iabilet.ro",
    },
    {
      "@type": "Offer",
      name: "VIP",
      price: "2800",
      priceCurrency: "RON",
      availability: "https://schema.org/LimitedAvailability",
      url: "https://www.iabilet.ro",
    },
  ],
  performer: {
    "@type": "Organization",
    name: "The Hunter House",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <MeridianTemplate />
    </>
  );
}
