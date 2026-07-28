import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import PrivacyPolicyTemplate from "@modules/legal/templates/privacy-policy"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })
  return {
    title: t("Politica de confidențialitate"),
    description: t("Cum colectăm, folosim și protejăm datele tale personale (GDPR)"),
  }
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyTemplate />
}
