"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getGlobalCacheOptions } from "./cookies"

export const listRegions = async () => {
  const next = getGlobalCacheOptions("regions")

  return await sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ regions }) => regions)
}

export const retrieveRegion = async (id: string) => {
  const next = getGlobalCacheOptions("regions")

  return await sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ region }) => region)
}

/**
 * Cookie-free region lookup for statically/ISR-rendered pages (product detail).
 * Avoids reading cookies so those pages can be prerendered and generated
 * on-demand without DYNAMIC_SERVER_USAGE. Cached with a static tag + ISR.
 */
export const getRegionStatic = async (countryCode: string) => {
  const regions = await sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next: { tags: ["regions"], revalidate: 3600 },
      cache: "force-cache",
    })
    .then(({ regions }) => regions)
    .catch(() => null)

  if (!regions?.length) return null

  for (const region of regions) {
    for (const c of region.countries ?? []) {
      if (c?.iso_2 === countryCode) return region
    }
  }
  return null
}

/**
 * Country -> region lookup.
 *
 * Deliberately holds no module-level cache: one used to live here and, being
 * process-lifetime with no TTL and no revalidateTag hook, it pinned currency,
 * tax-inclusive pricing and country lists to whatever the first request saw —
 * an admin region change only landed on redeploy. listRegions() is already
 * cached under the shared "regions" tag with a 1h TTL (getGlobalCacheOptions),
 * so leaning on Next's cache gives both a bounded staleness window and an
 * on-demand path via revalidateTag("regions") (see /api/revalidate).
 */
export const getRegion = async (countryCode: string) => {
  const regions = await listRegions()

  if (!regions) {
    return null
  }

  const regionMap = new Map<string, HttpTypes.StoreRegion>()
  regions.forEach((region) => {
    region.countries?.forEach((c) => {
      regionMap.set(c?.iso_2 ?? "", region)
    })
  })

  return countryCode ? regionMap.get(countryCode) : regionMap.get("us")
}
