import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { setRequestLocaleValue } from "@lib/util/request-locale"
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
  // generateMetadata is a separate invocation from the page component, so
  // it needs its own locale seed before fetching — see (main)/layout.tsx.
  setRequestLocaleValue(params.locale)
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  const description =
    (collection.metadata?.description as string | undefined) ??
    `${collection.title} — The Hunter House`

  return {
    // .absolute bypasses the root layout's title template — this string
    // already has the brand suffix baked in.
    title: { absolute: `${collection.title} | The Hunter House` },
    description,
    // This route duplicates /ready-to-wear/<handle> (the linked, canonical
    // version) — point search engines there to avoid duplicate-content
    // treatment while keeping this route itself reachable/functional.
    alternates: {
      canonical: `/ready-to-wear/${params.handle}`,
    },
  } satisfies Metadata
}

export default async function CollectionPage(props: Props) {
  const params = await props.params
  // Next may render this page concurrently with its ancestor layouts, so
  // re-seed from this segment's own params before fetching — see
  // (main)/layout.tsx.
  setRequestLocaleValue(params.locale)

  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  return <CollectionTemplate collection={collection} countryCode={"ro"} />
}

