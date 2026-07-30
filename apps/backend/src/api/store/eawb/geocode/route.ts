import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { geocodeAddress } from "../../../../modules/eawb/lib/geocode"

/**
 * Geocodes the cart's delivery address (used to center the checkout locker
 * map precisely). Fetched separately from GET /store/eawb/lockers so
 * Nominatim's latency never blocks the locker list itself from rendering.
 *
 * GET /store/eawb/geocode?cart_id=...
 * → { origin: { lat, lng } | null }
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cartId = req.query.cart_id as string | undefined
  if (!cartId) {
    return res.status(400).json({ error: "cart_id is required" })
  }

  const cartModule = req.scope.resolve(Modules.CART)
  const cart = await cartModule.retrieveCart(cartId, {
    select: ["id"],
    relations: ["shipping_address"],
  })
  const address = cart?.shipping_address as unknown as Record<string, unknown> | null

  const origin = await geocodeAddress({
    street: (address?.address_1 as string) || undefined,
    city: (address?.city as string) || undefined,
    county: (address?.province as string) || undefined,
    postalCode: (address?.postal_code as string) || undefined,
    countryCode: (address?.country_code as string) || undefined,
  })

  return res.json({ origin })
}
