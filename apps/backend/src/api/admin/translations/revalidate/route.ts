import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import revalidateStorefrontWorkflow from "../../../../workflows/revalidate-storefront"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  await revalidateStorefrontWorkflow(req.scope).run()
  return res.status(200).json({ ok: true })
}
