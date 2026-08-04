import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { routing } from "@i18n/routing"

import NotFoundContent from "@modules/common/components/not-found"

export async function generateMetadata({
  params,
}: {
  params?: Promise<{ locale?: string }>
}): Promise<Metadata> {
  const locale = (await params)?.locale ?? routing.defaultLocale
  const t = await getTranslations({ locale, namespace: "app" })
  return {
    title: t("404 — Profil negăsit"),
    description: t("Profilul pe care încerci să îl accesezi nu există"),
  }
}

export default async function NotFound({
  params,
}: {
  params?: Promise<{ locale?: string }>
}) {
  const locale = (await params)?.locale ?? routing.defaultLocale
  const t = await getTranslations({ locale, namespace: "app" })
  return (
    <NotFoundContent
      locale={locale}
      title={t("Profil negăsit")}
      description={t("Profilul pe care încerci să îl accesezi nu există")}
    />
  )
}
