import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

/**
 * On-demand revalidation endpoint.
 * Called by the Medusa backend (product subscriber) when products change,
 * so the storefront drops its cached product data without a full redeploy.
 *
 * Product caches are tagged per-visitor (`products-<cacheId>`), so a plain
 * revalidateTag("products") can't match them — revalidatePath("/", "layout")
 * is the reliable way to refresh every rendered page.
 */
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, message: "Invalid secret" }, { status: 401 })
  }

  revalidateTag("products")
  revalidatePath("/", "layout")

  return NextResponse.json({ ok: true, revalidated: true })
}
