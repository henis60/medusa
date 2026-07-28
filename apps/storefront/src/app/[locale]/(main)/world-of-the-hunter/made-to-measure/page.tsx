import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import MadeToMeasureTemplate from "@modules/pages/templates/made-to-measure"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })
  return {
    title: t("Made to Measure"),
    description: t("Ce înseamnă un costum Made to Measure — procesul, țesăturile, măsurătorile și diferența față de Ready to Wear Tailoring premium la Hunter House"
    ),
  }
}

export default function MadeToMeasurePage() {
  return <MadeToMeasureTemplate />
}
