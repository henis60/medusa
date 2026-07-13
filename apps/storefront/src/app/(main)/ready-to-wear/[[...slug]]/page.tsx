import { Metadata } from "next"

import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import StoreTemplate from "@modules/store/templates"

type Props = {
  params: Promise<{ slug?: string[] }>
}

// Static + ISR: the page reads no cookies and no searchParams on the server.
// Category/collection now come from the path (/ready-to-wear/<handle> or
// /ready-to-wear/<collection-handle>/<category-handle>); sort/price/color
// stay as query params, handled client-side — see StoreView / InfiniteProducts.
export const revalidate = 3600

export async function generateStaticParams() {
  const [categories, { collections }] = await Promise.all([
    listCategories(),
    listCollections(),
  ])

  return [
    { slug: [] },
    ...categories.map((c) => ({ slug: [c.handle] })),
    ...collections.map((c) => ({ slug: [c.handle] })),
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  if (!slug?.length) {
    return {
      title: "Ready to Wear",
      description: "Explore all of our products.",
    }
  }

  const [categories, { collections }] = await Promise.all([
    listCategories(),
    listCollections(),
  ])

  const lastHandle = slug[slug.length - 1]
  const category = categories.find((c) => c.handle === lastHandle)
  const collection = collections.find((c) => c.handle === lastHandle)
  const name = category?.name || collection?.title || "Ready to Wear"

  return {
    title: name,
    description: category?.description || "Explore all of our products.",
  }
}

export default async function StorePage() {
  return <StoreTemplate countryCode={"ro"} />
}
