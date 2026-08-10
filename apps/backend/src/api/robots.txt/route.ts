import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// Medusa's admin dashboard has no robots.txt of its own, so without this the
// request 404s at origin — Cloudflare then fills the gap with its own
// managed robots.txt (AI-crawler rules only), which never disallows regular
// search engines. admin.thehunter.ro is already gated behind Cloudflare
// Access, but this is a second, explicit signal that it must never be
// indexed even if Access is ever relaxed.
export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Content-Type", "text/plain")
  res.send("User-agent: *\nDisallow: /\n")
}
