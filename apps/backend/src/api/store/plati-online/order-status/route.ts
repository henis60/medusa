import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Returns the order id (if any) created from a cart. The storefront return page
 * polls this after PlatiOnline redirects the customer back, since the order is
 * completed server-side by the ITSN webhook.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cartId = req.query.cart_id as string | undefined
  if (!cartId) {
    return res.status(400).json({ message: "cart_id is required" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "order_cart",
    fields: ["order_id", "order.status", "order.display_id"],
    filters: { cart_id: cartId },
  })

  const link = data?.[0]
  if (!link?.order_id) {
    return res.json({ status: "pending", order_id: null })
  }

  return res.json({
    status: "completed",
    order_id: link.order_id,
    display_id: (link as any).order?.display_id ?? null,
  })
}
