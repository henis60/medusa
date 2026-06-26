import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";

export default async function sendOrderConfirmationEmail({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");
  logger.info(`Sending order confirmation for order: ${data.id}`);

  try {
    const query = container.resolve("query");
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
    });

    if (!orders?.length) {
      logger.error(`Order ${data.id} not found, skipping confirmation email`);
      return;
    }

    const order = orders[0];

    if (!order.email) {
      logger.error(
        `Order ${data.id} has no email address, skipping confirmation email`,
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
          `${order.customer?.first_name ?? ""} ${order.customer?.last_name ?? ""}`.trim() ||
          "Client",
        items: (order.items ?? []).map((item: any) => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: `${Number(item.unit_price ?? 0).toFixed(2)} ${(order.currency_code ?? "RON").toUpperCase()}`,
          subtotal: `${Number(item.subtotal ?? (item.unit_price ?? 0) * (item.quantity ?? 1)).toFixed(2)} ${(order.currency_code ?? "RON").toUpperCase()}`,
        })),
        total: `${Number(order.total ?? 0).toFixed(2)} ${(order.currency_code ?? "RON").toUpperCase()}`,
        shipping_address: order.shipping_address,
        storefront_url: process.env.VITE_STOREFRONT_URL,
        attachments: [
          {
            name: `factura-${order.display_id}.pdf`,
            // TEST: PDF minimal valid (o pagina alba)
            content:
              "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPJ4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKL1Jlc291cmNlcyA8PAovRm9udCA8PAovRjEgNSAwIFIKPj4KPj4KPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQKKEZhY3R1cmEgdGVzdCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjY2IDAwMDAwIG4gCjAwMDAwMDAzNjAgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MzUKJSVFT0YK",
          },
        ],
      },
    });

    logger.info(`Order confirmation email sent to ${order.email}`);
  } catch (error) {
    logger.error(
      `Failed to send order confirmation for ${data.id}: ${String(error?.message ?? error)}`,
    );
  }
}

export const config: SubscriberConfig = {
  event: ["order.placed", "order.completed"],
};
