import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import MeridianTemplate from "@modules/meridian/templates"

const URL = "https://thehunter.ro/meridian"
// Brand lockup used as the social-share card, at the standard 1.91:1 OG
// ratio so Facebook/X/WhatsApp display it uncropped.
const IMAGE = "https://thehunter.ro/meridian/thm-og.png"
const IMAGE_W = 1200
const IMAGE_H = 630
const IMAGE_ALT = "The Hunter Meridian"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meridian" })
  const title = t("metaTitle")
  const description = t("metaDescription")
  const ogDescription = t("metaOgDescription")

  return {
    // .absolute bypasses the root layout's "%s | The Hunter House" template —
    // this string is already the full title, brand included.
    title: { absolute: title },
    description,
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
      locale: locale === "en" ? "en_US" : "ro_RO",
      siteName: "The Hunter Meridian",
      title,
      description: ogDescription,
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
      title,
      description: ogDescription,
      images: [IMAGE],
    },
    robots: { index: true, follow: true },
  }
}

export default async function MeridianPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meridian" })

  // Event structured data — lets Google show the date, venue and ticket link
  // directly in results / the events carousel.
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `The Hunter Meridian — ${t("Ediția I")}`,
    description: t("metaDescription"),
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
