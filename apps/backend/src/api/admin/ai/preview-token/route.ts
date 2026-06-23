import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productId = req.query.product_id as string
  if (!productId) {
    return res.status(400).json({ error: "product_id required" })
  }

  return res.json({ token: productId })
}
