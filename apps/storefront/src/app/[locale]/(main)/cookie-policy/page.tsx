import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import CookiePolicyTemplate from "@modules/legal/templates/cookie-policy"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })
  return {
    title: t("Politica de cookies"),
    description: t("Ce cookies folosim și cum le poți controla"),
  }
}

export default function CookiePolicyPage() {
  return <CookiePolicyTemplate />
}
