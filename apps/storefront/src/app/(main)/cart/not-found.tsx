import { Metadata } from "next"

import NotFoundContent from "@modules/common/components/not-found"

export const metadata: Metadata = {
  title: "404 — Coș negăsit",
  description: "Coșul pe care încerci să îl accesezi nu există.",
}

export default function NotFound() {
  return (
    <NotFoundContent
      title="Coș negăsit"
      description="Coșul pe care încerci să îl accesezi nu există. Șterge cookie-urile și încearcă din nou."
    />
  )
}
