import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import NotFoundContent from "@modules/common/components/not-found"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })
  return {
    title: t("404 — Coș negăsit"),
    description: t("Coșul pe care încerci să îl accesezi nu există"),
  }
}

export default async function NotFound({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })
  return (
    <NotFoundContent
      locale={locale}
      title={t("Coș negăsit")}
      description={t(
        "Coșul pe care încerci să îl accesezi nu există Șterge cookie-urile și încearcă din nou",
      )}
    />
  )
}
