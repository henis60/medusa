import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    collection?: string
    category?: string
  }>
  params: Promise<Record<string, string>>
}

export default async function StorePage(props: Params) {
  const searchParams = await props.searchParams
  const { sortBy, collection, category } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      countryCode={"ro"}
      collectionId={collection}
      categoryId={category}
    />
  )
}

