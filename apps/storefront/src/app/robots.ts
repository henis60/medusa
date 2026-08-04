import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseURL()

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/preview/",
        "/profil",
        "/cos",
        "/wishlist",
        "/finalizare-comanda",
        "/comanda",
        "/reset-password",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
