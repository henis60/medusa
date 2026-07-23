import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
const token = req.query.token as string
  if (!token) {
    return res.status(401).json({ error: "Missing preview token" })
  }

  const { handle } = req.params as { handle: string }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Note: prices are returned unscoped; the storefront preview page selects the
  // matching currency from region.currency_code (region_id is sent but the
  // preview shows raw variant.prices, not calculated_price).

  const { data: products } = await query.graph({
    entity: "product",
    filters: { handle },
    fields: [
      "id", "title", "subtitle", "description", "handle", "status",
      "thumbnail", "material", "metadata",
      "images.*",
      "options.*",
      "options.values.*",
      "variants.*",
      "variants.options.*",
      "variants.prices.*",
      "variants.images.*",
      "categories.*",
      "collection.*",
      "tags.*",
    ],
  })

  const product = products?.[0]
  if (!product) {
    return res.status(404).json({ error: "Product not found" })
  }

  if ((product as any).status !== "proposed") {
    return res.status(404).json({ error: "Product not available for preview" })
  }

  if ((product as any).id !== token) {
    return res.status(401).json({ error: "Invalid preview token" })
  }

  return res.json({ product })
}

