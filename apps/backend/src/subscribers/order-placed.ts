import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

export default async function sendOrderConfirmationEmail({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  logger.info(`Sending order confirmation for order: ${data.id}`)

  try {
    const query = container.resolve("query")
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "total",
        "currency_code",
        "customer.first_name",
        "customer.last_name",
        "items.*",
        "items.variant.product.title",
        "shipping_address.*",
      ],
      filters: { id: data.id },
    })

    if (!orders?.length) {
      logger.error(`Order ${data.id} not found, skipping confirmation email`)
      return
    }

    const order = orders[0]

    if (!order.email) {
      logger.error(`Order ${data.id} has no email address, skipping confirmation email`)
      return
    }

    const notificationService = container.resolve("notification")

    await notificationService.createNotifications({
      to: order.email,
      template: "order-confirmation",
      channel: "email",
      data: {
        order_id: order.display_id,
        customer_name: `${order.customer?.first_name ?? ""} ${order.customer?.last_name ?? ""}`.trim(),
        items: order.items,
        total: order.total,
        currency: order.currency_code,
        shipping_address: order.shipping_address,
      },
    })

    logger.info(`Order confirmation email sent to ${order.email}`)
  } catch (error) {
    logger.error(
      `Failed to send order confirmation for ${data.id}: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
