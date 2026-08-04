// Geocodes a delivery address to lat/lng using OpenStreetMap's Nominatim
// (free, no API key). Used only to center the checkout locker map on the
// customer's actual street address instead of the wider locality/county
// bounds the eAWB fixed-locations lookup uses.
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

export async function geocodeAddress(parts: {
  street?: string
  city?: string
  county?: string
  postalCode?: string
  countryCode?: string
}): Promise<{ lat: number; lng: number } | null> {
  const q = [parts.street, parts.city, parts.county, parts.postalCode]
    .filter(Boolean)
    .join(", ")
  if (!q) return null

  const qs = new URLSearchParams({
    q,
    format: "json",
    limit: "1",
    countrycodes: (parts.countryCode ?? "ro").toLowerCase(),
  })

  try {
    const res = await fetch(`${NOMINATIM_URL}?${qs.toString()}`, {
      headers: {
        // Nominatim's usage policy requires an identifying User-Agent.
        "User-Agent": "medusa-store-checkout/1.0",
        Accept: "application/json",
      },
      // Nominatim's free endpoint can be slow; this is only used to nudge the
      // map's initial center, so give up quickly rather than making the
      // customer wait on it.
      signal: AbortSignal.timeout(2500),
    })
    if (!res.ok) return null

    const results = (await res.json()) as Array<{ lat: string; lon: string }>
    const first = results[0]
    if (!first) return null

    return { lat: Number(first.lat), lng: Number(first.lon) }
  } catch {
    return null
  }
}
