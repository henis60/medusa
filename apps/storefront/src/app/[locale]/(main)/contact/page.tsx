import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import ContactTemplate from "@modules/contact/templates"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })
  return {
    title: t("Contact"),
    description: t("Scrie-ne — răspundem în maximum 24 de ore în zilele lucrătoare"),
  }
}

export default function ContactPage() {
  return <ContactTemplate />
}
