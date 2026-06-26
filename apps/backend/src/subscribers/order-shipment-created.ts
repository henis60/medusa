import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";

export default async function sendOrderShippedEmail({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; order_id: string }>) {
  const logger = container.resolve("logger");
  logger.info(`Sending shipment notification for order: ${data.order_id}`);

  try {
    const query = container.resolve("query");
    const { data: fulfillments } = await query.graph({
      entity: "fulfillment",
      fields: ["tracking_numbers"],
      filters: { id: data.id },
    });

    const trackingNumber = fulfillments?.[0]?.tracking_numbers?.[0] ?? null;

    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "customer.first_name",
        "customer.last_name",
        "shipping_address.*",
      ],
      filters: { id: data.order_id },
    });

    if (!orders?.length) {
      logger.error(`Order ${data.order_id} not found, skipping shipment email`);
      return;
    }

    const order = orders[0];

    if (!order.email) {
      logger.error(
        `Order ${data.order_id} has no email address, skipping shipment email`,
      );
      return;
    }

    const notificationService = container.resolve("notification");

    await notificationService.createNotifications({
      to: order.email,
      template: "5",
      channel: "email",
      data: {
        order_id: order.display_id,
        customer_name:
          `${order.customer?.first_name ?? ""} ${order.customer?.last_name ?? ""}`.trim(),
        shipping_address: order.shipping_address,
        tracking_number: trackingNumber,
        storefront_url: process.env.VITE_STOREFRONT_URL,
      },
    });

    logger.info(`Shipment email sent to ${order.email}`);
  } catch (error) {
    logger.error(
      `Failed to send shipment email for order ${data.order_id}: ${error.message}`,
    );
  }
}

export const config: SubscriberConfig = {
  event: "order.shipment_created",
};
