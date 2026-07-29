import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import CustomerServiceTemplate from "@modules/customer-service/templates"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })
  return {
    title: t("Relații cu clienții"),
    description: t("Contact, comenzi, livrare, retur, garanție și informații legale"),
  }
}

export default function CustomerServicePage() {
  return <CustomerServiceTemplate />
}
