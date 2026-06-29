import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { EuroparcelClient } from "../../../../modules/eawb/lib/client"

/**
 * Lists the lockers (easybox / fixed locations) available for a given eAWB
 * shipping option, near the cart's delivery locality. Used by the checkout
 * locker picker for "...to locker" services.
 *
 * GET /store/eawb/lockers?option_id=...&cart_id=...
 * → { lockers: [{ id, name, address }] }
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const optionId = req.query.option_id as string | undefined
  const cartId = req.query.cart_id as string | undefined
  if (!optionId || !cartId) {
    return res.status(400).json({ error: "option_id and cart_id are required" })
  }

  const apiKey = process.env.EAWB_API_KEY
  if (!apiKey) {
    return res.json({ lockers: [] })
  }

  const fulfillmentModule = req.scope.resolve(Modules.FULFILLMENT)
  const option = await fulfillmentModule.retrieveShippingOption(optionId, {
    select: ["id", "data"],
  })
  const carrierId = (option?.data as { carrier_id?: number })?.carrier_id
  if (carrierId == null) {
    return res.json({ lockers: [] })
  }

  const cartModule = req.scope.resolve(Modules.CART)
  const cart = await cartModule.retrieveCart(cartId, {
    select: ["id"],
    relations: ["shipping_address"],
  })
  const address = cart?.shipping_address as unknown as Record<string, unknown> | null

  const client = new EuroparcelClient(apiKey)
  try {
    const locations = await client.getFixedLocations({
      carrier_id: carrierId,
      locality_name: (address?.city as string) || undefined,
      county_name: (address?.province as string) || undefined,
    })

    const lockers = (locations ?? [])
      .filter((l) => l.is_active)
      .map((l) => ({ id: l.id, name: l.name, address: l.address }))

    return res.json({ lockers })
  } catch (err) {
    return res.status(200).json({ lockers: [], error: (err as Error).message })
  }
}
