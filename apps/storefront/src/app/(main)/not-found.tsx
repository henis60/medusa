import { Metadata } from "next"

import NotFoundContent from "@modules/common/components/not-found"

export const metadata: Metadata = {
  title: "404 — Pagină negăsită",
  description: "Pagina pe care încerci să o accesezi nu există.",
}

export default function NotFound() {
  return <NotFoundContent />
}
