import { Metadata } from "next"
import ProgramareTemplate from "@modules/programare/templates"

export const metadata: Metadata = {
  title: "Programare",
  description: "Rezervă o consultație personalizată sau o sesiune made-to-measure la The Hunter House.",
}

export default function ProgramarePage() {
  return <ProgramareTemplate />
}
