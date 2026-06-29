import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { EuroparcelClient } from "../../../../modules/eawb/lib/client"
import { buildContent, roundShippingPrice, toEpAddress } from "../../../../modules/eawb/lib/pricing"

// Account-level ids (from/billing) rarely change — cache them per server process.
let fromAddressId: number | null = null
let billingAddressId: number | null = null

async function getFromAddressId(client: EuroparcelClient): Promise<number | null> {
  if (fromAddressId) return fromAddressId
  const res = await client.getShippingAddresses({ all: true })
  const def = res.list?.find((a) => a.is_default) ?? res.list?.[0]
  fromAddressId = def?.id ?? null
  return fromAddressId
}

async function getBillingAddressId(client: EuroparcelClient): Promise<number | null> {
  if (billingAddressId) return billingAddressId
  const res = await client.getBillingAddresses({ all: true })
  billingAddressId = res.list?.[0]?.id ?? null
  return billingAddressId
}

/**
 * Returns live courier prices for ALL eAWB shipping options in a single call.
 * Europarcel's price endpoint, queried with carrier_id/service_id = 0, returns
 * every available carrier/service for the route at once — so the storefront
 * needs one request instead of one per option.
 *
 * GET /store/eawb/shipping-prices?cart_id=...
 * → { prices: { [shipping_option_id]: amount } }   (only positive prices)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cartId = req.query.cart_id as string | undefined
  if (!cartId) {
    return res.status(400).json({ error: "cart_id is required" })
  }

  const apiKey = process.env.EAWB_API_KEY
  if (!apiKey) {
    return res.json({ prices: {} })
  }

  const cartModule = req.scope.resolve(Modules.CART)
  const cart = await cartModule.retrieveCart(cartId, {
    select: ["id", "email"],
    relations: ["shipping_address", "items"],
  })

  const shippingAddress = cart?.shipping_address as unknown as
    | Record<string, unknown>
    | null
  if (!shippingAddress?.city) {
    return res.json({ prices: {} })
  }

  // Map carrier/service → Medusa shipping_option id.
  const fulfillmentModule = req.scope.resolve(Modules.FULFILLMENT)
  const options = await fulfillmentModule.listShippingOptions(
    { provider_id: "eawb_eawb" } as any,
    { select: ["id", "data"] }
  )
  const optionByKey = new Map<string, string>()
  for (const o of options) {
    const d = (o.data ?? {}) as { carrier_id?: number; service_id?: number }
    if (d.carrier_id != null && d.service_id != null) {
      optionByKey.set(`${d.carrier_id}_${d.service_id}`, o.id)
    }
  }

  const client = new EuroparcelClient(apiKey)

  try {
    const [fromId, billingId] = await Promise.all([
      getFromAddressId(client),
      getBillingAddressId(client),
    ])
    if (!fromId || !billingId) {
      return res.json({ prices: {} })
    }

    const result = await client.calculatePrices({
      carrier_id: 0,
      service_id: 0,
      billing_to: { billing_address_id: billingId },
      address_from: { address_from_id: fromId },
      address_to: toEpAddress(shippingAddress),
      content: buildContent((cart.items ?? []) as Array<{ quantity?: number }>),
      extra: { parcel_content: "Produse" },
    })

    const prices: Record<string, number> = {}
    for (const opt of result.data ?? []) {
      const key = `${opt.carrier_id}_${opt.service_id}`
      const optionId = optionByKey.get(key)
      const total = opt.price?.total
      if (optionId && typeof total === "number" && total > 0) {
        prices[optionId] = roundShippingPrice(total)
      }
    }

    return res.json({ prices })
  } catch (err) {
    return res.status(200).json({ prices: {}, error: (err as Error).message })
  }
}
