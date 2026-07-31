import NotFoundContent from "@modules/common/components/not-found"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })
  return {
    title: t("404 — Pagină negăsită"),
    description: t("Pagina pe care încerci să o accesezi nu există"),
  }
}

export default async function NotFound({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return <NotFoundContent locale={locale} />
}
