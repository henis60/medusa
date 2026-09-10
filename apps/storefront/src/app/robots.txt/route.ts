import { NextResponse } from "next/server"
import { getBaseURL } from "@lib/util/env"

// A plain Route Handler instead of Next's `robots.ts` metadata-file
// convention — that helper's typed `MetadataRoute.Robots` return has no way
// to emit a `Content-Signal` line (a newer, non-standard extension), which
// is needed here to declare the nuance Cloudflare's "Managed robots.txt"
// toggle couldn't: search/reference crawling is fine, AI training is not.
// That Cloudflare toggle must be OFF for this file's content to actually
// reach visitors — while it's on, its own injected block (hard `Disallow`
// for every named AI bot, not just for training use) replaces this output
// entirely at the edge.
export const dynamic = "force-static"

export async function GET() {
  const baseUrl = getBaseURL()

  const body = `User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /
Disallow: /api/
Disallow: /preview/
Disallow: /profil
Disallow: /cos
Disallow: /wishlist
Disallow: /finalizare-comanda
Disallow: /comanda
Disallow: /reset-password

Sitemap: ${baseUrl}/sitemap.xml
`

  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
