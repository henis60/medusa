import { Metadata } from "next"

import ContactTemplate from "@modules/contact/templates"

export const metadata: Metadata = {
  title: "Contact",
  description: "Scrie-ne — răspundem în maximum 24 de ore în zilele lucrătoare.",
}

export default function ContactPage() {
  return <ContactTemplate />
}
