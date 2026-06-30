import { NextRequest, NextResponse } from "next/server"
import data from "@lib/data/ro-localities.json"

type Locality = { id: number; name: string }

const byCounty = data.byCounty as Record<string, Locality[]>

// Static dataset — cache aggressively on the client/CDN.
const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
}

export async function GET(req: NextRequest) {
  const countyId = req.nextUrl.searchParams.get("county_id")

  if (countyId) {
    return NextResponse.json(
      { localities: byCounty[countyId] ?? [] },
      { headers: CACHE_HEADERS }
    )
  }

  return NextResponse.json({ counties: data.counties }, { headers: CACHE_HEADERS })
}
