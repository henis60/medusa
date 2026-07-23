import { Metadata } from "next"

import PrivacyPolicyTemplate from "@modules/legal/templates/privacy-policy"

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description: "Cum colectăm, folosim și protejăm datele tale personale (GDPR).",
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyTemplate />
}
