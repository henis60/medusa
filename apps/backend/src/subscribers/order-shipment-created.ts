import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";

export default async function sendOrderShippedEmail({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  const logger = container.resolve("logger");
  // Medusa emite `shipment.created` cu { id, no_notification }: `id` e
  // fulfillment-ul, iar comanda NU vine în eveniment — se află din legătura
  // order↔fulfillment, mai jos. (Înainte ascultam „order.shipment_created",
  // un eveniment care nu există, deci emailul nu pleca niciodată.)
  logger.info(`shipment.created primit pentru fulfillment ${data.id}`);

  // Operatorul a bifat „nu trimite notificare" la marcarea ca expediat.
  if (data.no_notification) {
    logger.info(`Email de expediere omis pentru fulfillment ${data.id} (no_notification)`);
    return;
  }

  // În afara try, ca să poată fi numită și în catch.
  let orderId: string | undefined;

  try {
    const query = container.resolve("query");

    const { data: links } = await query.graph({
      entity: "order_fulfillment",
      fields: ["order_id"],
      filters: { fulfillment_id: data.id },
    });
    orderId = links?.[0]?.order_id as string | undefined;
    if (!orderId) {
      logger.error(
        `Nu am găsit comanda pentru fulfillment ${data.id}, emailul de expediere nu se trimite`,
      );
      return;
    }

    const { data: fulfillments } = await query.graph({
      entity: "fulfillment",
      fields: ["labels.tracking_number", "labels.tracking_url"],
      filters: { id: data.id },
    });

    const label = fulfillments?.[0]?.labels?.[0];
    const trackingNumber = label?.tracking_number ?? null;

    // Linkul de urmărire de la curier (același `track_url` pe care îl arată
    // butonul „Tracking" din widgetul eAWB). Valorile „#" și gol sunt
    // marcaje, nu linkuri: la DRY_RUN eticheta are tracking_url „#", iar un
    // buton cu href „#" ar duce clientul nicăieri. Fără link valid trimitem
    // null, ca șablonul să poată ascunde butonul.
    const rawUrl = label?.tracking_url?.trim()
    const trackingUrl =
      rawUrl && rawUrl !== "#" && /^https?:\/\//i.test(rawUrl) ? rawUrl : null

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
      filters: { id: orderId },
    });

    if (!orders?.length) {
      logger.error(`Order ${orderId} not found, skipping shipment email`);
      return;
    }

    const order = orders[0];

    if (!order.email) {
      logger.error(
        `Order ${orderId} has no email address, skipping shipment email`,
      );
      return;
    }

    const notificationService = container.resolve("notification");

    await notificationService.createNotifications({
      to: order.email,
      template: "6",
      channel: "email",
      data: {
        order_id: order.display_id,
        // Contul clientului, apoi adresa de livrare (comenzile fără cont nu
        // au `customer`). Același lanț ca în order-placed.ts.
        customer_name:
          `${order.customer?.first_name ?? ""} ${order.customer?.last_name ?? ""}`.trim() ||
          `${order.shipping_address?.first_name ?? ""} ${order.shipping_address?.last_name ?? ""}`.trim() ||
          "Client",
        shipping_address: order.shipping_address,
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        storefront_url: process.env.VITE_STOREFRONT_URL,
      },
    });

    logger.info(
      `Shipment email sent for order ${order.id} ` +
        `(awb=${trackingNumber ?? "-"}, link=${trackingUrl ? "da" : "nu"})`,
    );
  } catch (error) {
    // Not rethrown: a notification failure can happen after the provider
    // accepted the message, so an event-bus retry risks a duplicate email.
    logger.error(
      `Failed to send shipment email for fulfillment ${data.id} ` +
        `(order ${orderId ?? "necunoscută"}): ${error.message}`,
    );
  }
}

export const config: SubscriberConfig = {
  event: "shipment.created",
};
