import { Metadata } from "next"

import MeridianTemplate from "@modules/meridian/templates"

export const metadata: Metadata = {
  title: "The Hunter Meridian — Ediția I",
  description:
    "26 septembrie 2026, Colonia Pictorilor, Baia Mare. Douăsprezece automobile în perechi clasic–contemporan, concert de blues & jazz, expoziție de pictură și sculptură și trei colecții Made to Measure The Hunter House.",
  openGraph: {
    title: "The Hunter Meridian — Ediția I",
    description:
      "26 septembrie 2026, Colonia Pictorilor, Baia Mare. O zi de automobile de colecție, blues & jazz, artă și Made to Measure.",
    images: ["/meridian/thm-piesa.webp"],
  },
}

export default function MeridianPage() {
  return <MeridianTemplate />
}
