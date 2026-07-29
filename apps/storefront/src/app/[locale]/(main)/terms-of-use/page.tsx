import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import TermsOfUseTemplate from "@modules/legal/templates/terms-of-use"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })
  return {
    title: t("Termeni și Condiții"),
    description: t("Termenii și condițiile de utilizare a platformei The Hunter House"),
  }
}

export default function TermsOfUsePage() {
  return <TermsOfUseTemplate />
}
