import { Metadata } from "next"

import CookiePolicyTemplate from "@modules/legal/templates/cookie-policy"

export const metadata: Metadata = {
  title: "Politica de cookies",
  description: "Ce cookies folosim și cum le poți controla.",
}

export default function CookiePolicyPage() {
  return <CookiePolicyTemplate />
}
