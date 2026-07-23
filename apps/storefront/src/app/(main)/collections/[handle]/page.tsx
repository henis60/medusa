import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { StoreCollection } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"

type Props = {
  params: Promise<Record<string, string>>
}

// Static + ISR: sort/continuous loading are handled client-side, so the page
// reads no searchParams and serves cached HTML without hitting the backend.
export const revalidate = 3600

export async function generateStaticParams() {
  const { collections } = await listCollections({ fields: "*products" })

  if (!collections) return []

  return collections.map((collection: StoreCollection) => ({
    handle: collection.handle,
  }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  const metadata = {
    title: `${collection.title} | Medusa Store`,
    description: `${collection.title} collection`,
  } as Metadata

  return metadata
}

export default async function CollectionPage(props: Props) {
  const params = await props.params

  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  return <CollectionTemplate collection={collection} countryCode={"ro"} />
}

