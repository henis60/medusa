import { Metadata } from "next"

import CustomerServiceTemplate from "@modules/customer-service/templates"

export const metadata: Metadata = {
  title: "Relații cu clienții",
  description:
    "Contact, comenzi, livrare, retur, garanție și informații legale.",
}

export default function CustomerServicePage() {
  return <CustomerServiceTemplate />
}
