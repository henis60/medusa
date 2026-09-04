import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { routing } from "@i18n/routing"
import MadeToMeasureTemplate from "@modules/pages/templates/made-to-measure"

export async function generateMetadata({
  params,
}: {
  params?: Promise<{ locale?: string }>
}): Promise<Metadata> {
  const locale = (await params)?.locale ?? routing.defaultLocale
  const t = await getTranslations({ locale, namespace: "app" })
  return {
    title: t("Made to Measure"),
    description: t(
      "Ce înseamnă un costum Made to Measure - procesul, țesăturile, măsurătorile și diferența față de Ready to Wear Tailoring premium la Hunter House",
    ),
  }
}

export default async function MadeToMeasurePage({
  params,
}: {
  params?: Promise<{ locale?: string }>
}) {
  const locale = (await params)?.locale ?? routing.defaultLocale

  return <MadeToMeasureTemplate />
}
