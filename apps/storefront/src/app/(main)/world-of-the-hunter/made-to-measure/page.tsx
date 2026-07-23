import { Metadata } from "next"
import MadeToMeasureTemplate from "@modules/pages/templates/made-to-measure"

export const metadata: Metadata = {
  title: "Made to Measure",
  description: "Ce înseamnă un costum Made to Measure — procesul, țesăturile, măsurătorile și diferența față de Ready to Wear. Tailoring premium la Hunter House.",
}

export default function MadeToMeasurePage() {
  return <MadeToMeasureTemplate />
}
