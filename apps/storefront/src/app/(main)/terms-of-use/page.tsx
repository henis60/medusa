import { Metadata } from "next"

import TermsOfUseTemplate from "@modules/legal/templates/terms-of-use"

export const metadata: Metadata = {
  title: "Termeni și Condiții",
  description: "Termenii și condițiile de utilizare a platformei The Hunter House.",
}

export default function TermsOfUsePage() {
  return <TermsOfUseTemplate />
}
