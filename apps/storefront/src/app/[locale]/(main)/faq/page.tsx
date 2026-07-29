import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import FAQTemplate from "@modules/faq/templates"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })
  return {
    title: t("Întrebări frecvente"),
    description: t("Răspunsuri despre comenzi, livrare, retururi și plată"),
  }
}

export default function FAQPage() {
  return <FAQTemplate />
}
