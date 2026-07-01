"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listRegions = async () => {
  const next = {
    ...(await getCacheOptions("regions")),
  }

  return await sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ regions }) => regions)
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

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

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  if (regionMap.has(countryCode)) {
    return regionMap.get(countryCode)
  }

  const regions = await listRegions()

  if (!regions) {
    return null
  }

  regions.forEach((region) => {
    region.countries?.forEach((c) => {
      regionMap.set(c?.iso_2 ?? "", region)
    })
  })

  const region = countryCode
    ? regionMap.get(countryCode)
    : regionMap.get("us")

  return region
}
