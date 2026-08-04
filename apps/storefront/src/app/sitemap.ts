import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"
import { getRegionStatic } from "@lib/data/regions"
import { listProductHandles } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"

// Google should only index the Romanian version of the site (see
// routing.ts / middleware — locale isn't in the URL and Accept-Language
// negotiation is disabled, so every URL always serves Romanian by default
// unless a visitor has explicitly switched via the locale cookie). The
// sitemap therefore lists each URL once, with no per-locale duplicates.
const STATIC_ROUTES = [
  "",
  "/ready-to-wear",
  "/made-to-measure",
  "/contact",
  "/faq",
  "/relatii-clienti",
  "/terms-of-use",
  "/privacy-policy",
  "/cookie-policy",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseURL()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }))

  const region = await getRegionStatic("ro")
  if (!region) {
    return staticEntries
  }

  const [handles, categories, { collections }] = await Promise.all([
    listProductHandles(region.id),
    listCategories().catch(() => []),
    listCollections().catch(() => ({ collections: [] })),
  ])

  const productEntries: MetadataRoute.Sitemap = handles.map((handle) => ({
    url: `${baseUrl}/produs/${handle}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  }))

  const categoryEntries: MetadataRoute.Sitemap = categories.map(
    (category) => ({
      url: `${baseUrl}/ready-to-wear/${category.handle}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    })
  )

  const collectionEntries: MetadataRoute.Sitemap = collections.map(
    (collection) => ({
      url: `${baseUrl}/ready-to-wear/${collection.handle}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    })
  )

  return [
    ...staticEntries,
    ...productEntries,
    ...categoryEntries,
    ...collectionEntries,
  ]
}
