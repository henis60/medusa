import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { completeCartWorkflow } from "@medusajs/core-flows"

export default async function netopiaCompleteCart({
  event: { data },
  container,
}: SubscriberArgs<{ session_id: string }>) {
  const logger = container.resolve("logger")
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const sessionId = data.session_id

  logger.info(`Netopia: completare coș pentru sesiunea ${sessionId}`)

  // Rezolvă cart_id din payment session
  let cartId: string | null = null
  try {
    const { data: sessions } = await query.graph({
      entity: "payment_session",
      fields: ["payment_collection_id"],
      filters: { id: sessionId },
    })
    const collectionId = sessions?.[0]?.payment_collection_id
    if (!collectionId) {
      logger.warn(`Netopia subscriber: colecție negăsită pentru sesiunea ${sessionId}`)
      return
    }

    const { data: links } = await query.graph({
      entity: "cart_payment_collection",
      fields: ["cart_id"],
      filters: { payment_collection_id: collectionId },
    })
    cartId = links?.[0]?.cart_id ?? null
  } catch (err) {
    logger.error(`Netopia subscriber: eroare la rezolvarea cart_id — ${(err as Error).message}`)
    return
  }

  if (!cartId) {
    logger.warn(`Netopia subscriber: cart negăsit pentru sesiunea ${sessionId} (poate deja completat)`)
    return
  }

  try {
    const { result } = await completeCartWorkflow(container).run({
      input: { id: cartId },
    })
    logger.info(`Netopia subscriber: coș ${cartId} completat, order ${result?.id}`)
  } catch (err) {
    // Coșul poate fi deja completat de pe pagina de polling — ignorăm
    logger.warn(`Netopia subscriber: completeCartWorkflow — ${(err as Error).message}`)
  }
}

export const config: SubscriberConfig = {
  event: "netopia.payment.authorized",
}
