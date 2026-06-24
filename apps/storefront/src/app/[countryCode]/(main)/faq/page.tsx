import { Metadata } from "next"

import FAQTemplate from "@modules/faq/templates"

export const metadata: Metadata = {
  title: "Întrebări frecvente",
  description: "Răspunsuri despre comenzi, livrare, retururi și plată.",
}

export default function FAQPage() {
  return <FAQTemplate />
}
