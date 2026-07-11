import { Metadata } from "next"

import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

// Static + ISR: the page reads no cookies and no searchParams on the server.
// Filtering (collection / category / sortBy) is handled client-side from the
// URL, refetching via server actions — see StoreView / InfiniteProducts.
export const revalidate = 3600

export default async function StorePage() {
  return <StoreTemplate countryCode={"ro"} />
}
