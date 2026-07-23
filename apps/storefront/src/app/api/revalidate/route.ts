import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

/**
 * On-demand revalidation endpoint.
 * Called by the Medusa backend (product subscriber) when catalog data changes,
 * so the storefront drops its cached data without a full redeploy.
 *
 * Global catalog data now uses stable, shared tags (see getGlobalCacheOptions),
 * so targeted revalidateTag(...) refreshes every visitor's cache in one call —
 * no need to nuke the whole route tree with revalidatePath("/", "layout").
 */
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")

  if (
    !process.env.REVALIDATE_SECRET ||
    secret !== process.env.REVALIDATE_SECRET
  ) {
    return NextResponse.json(
      { ok: false, message: "Invalid secret" },
      { status: 401 }
    )
  }

  revalidateTag("products")
  revalidateTag("collections")
  revalidateTag("categories")

  return NextResponse.json({ ok: true, revalidated: true })
}
