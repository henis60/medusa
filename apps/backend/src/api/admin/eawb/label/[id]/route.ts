import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { EuroparcelClient } from "../../../../../modules/eawb/lib/client"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }

  const fulfillmentModule = req.scope.resolve(Modules.FULFILLMENT)
  const [fulfillment] = await fulfillmentModule.listFulfillments(
    { id: [id] },
    { select: ["id", "data", "provider_id"] }
  )

  if (!fulfillment) {
    return res.status(404).json({ error: "Fulfillment not found" })
  }

  const pid = fulfillment.provider_id
  if (!pid?.startsWith("eawb_") && !pid?.startsWith("fp_eawb_")) {
    return res.status(400).json({ error: "Not an eAWB fulfillment" })
  }

  const data = fulfillment.data as Record<string, unknown>

  if (data?.dry_run) {
    return res.status(400).json({ error: "Label unavailable in DRY_RUN mode" })
  }

  const awb = data?.awb as string | undefined
  if (!awb) {
    return res.status(400).json({ error: "No AWB found for this fulfillment" })
  }

  const apiKey = process.env.EAWB_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: "EAWB_API_KEY not configured" })
  }

  const client = new EuroparcelClient(apiKey)
  const result = await client.generateLabelLink(awb)

  return res.json({ url: result.download_url, awb: result.awb })
}
