import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";
import { capturePaymentWorkflow } from "@medusajs/core-flows";
import { runCreateOblioInvoice } from "../workflows/create-oblio-invoice";

export default async function sendOrderConfirmationEmail({
  event: { data, name: eventName },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");
  logger.info(`Trimitere email confirmare pentru comanda: ${data.id}`);

  // Auto-capture plată la plasarea comenzii
  if (eventName === "order.placed") {
    const query = container.resolve("query")
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "payment_collections.id",
        "payment_collections.payments.id",
        "payment_collections.payments.captured_at",
        "payment_collections.payments.canceled_at",
      ],
      filters: { id: data.id },
    })
    const payments = orders?.[0]?.payment_collections?.flatMap((pc: any) => pc.payments ?? []) ?? []

    for (const payment of payments) {
      // `order.placed` can be redelivered (event-bus retry, replay), and a
      // second capture on an already-captured payment is an error rather than
      // a no-op — skip anything already captured or canceled.
      if (payment.captured_at) {
        logger.info(`Plată ${payment.id} deja capturată, se omite (comanda ${data.id})`)
        continue
      }
      if (payment.canceled_at) {
        logger.warn(`Plată ${payment.id} anulată, nu se capturează (comanda ${data.id})`)
        continue
      }

      try {
        await capturePaymentWorkflow(container).run({ input: { payment_id: payment.id } })
        logger.info(`Plată ${payment.id} capturată automat pentru comanda ${data.id}`)
      } catch (err) {
        // Deliberately rethrown: money not captured is worse than a delayed
        // confirmation email, and this runs *before* the email is sent, so a
        // event-bus retry re-runs cleanly (the guard above makes the capture
        // idempotent) without any risk of a duplicate email. A permanently
        // failing capture surfaces as a failed job that needs a human.
        logger.error(
          `CAPTURE FAILED: plata ${payment.id} pentru comanda ${data.id} nu a putut fi capturată — ` +
          String((err as Error)?.message ?? err)
        )
        throw err
      }
    }
  }

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
        "metadata",
        "customer.first_name",
        "customer.last_name",
        "items.*",
        "items.variant.product.title",
        "shipping_address.*",
      ],
      filters: { id: data.id },
    });

    if (!orders?.length) {
      logger.error(`Comanda ${data.id} negăsită, se omite emailul de confirmare`);
      return;
    }

    const order = orders[0];

    if (!order.email) {
      logger.error(`Comanda ${data.id} nu are adresă de email`);
      return;
    }

    // Generare factură Oblio (cu idempotență internă)
    let invoiceAttachment: { name: string; content: string } | null = null
    try {
      const result = await runCreateOblioInvoice(container, data.id)
      invoiceAttachment = {
        name: `factura-${order.display_id}.pdf`,
        content: result.pdf_base64,
      }
      logger.info(
        `Factură Oblio generată: ${result.series}/${result.number} pentru comanda ${data.id}`
      )
    } catch (invoiceError) {
      logger.error(
        `Eroare la generarea facturii Oblio pentru comanda ${data.id}: ` +
        String((invoiceError as Error)?.message ?? invoiceError)
      )
      // Continuăm cu trimiterea emailului chiar dacă factura a eșuat
    }

    const notificationService = container.resolve("notification");

    await notificationService.createNotifications({
      to: order.email,
      template: "5",
      channel: "email",
      data: {
        order_id: order.display_id,
        // Links to the standalone /comanda/[id] confirmation page (no login
        // required — matches the post-payment redirect), not /profil/comenzi,
        // which 404s/requires auth for guest checkouts. Mirrors
        // orderIdToSlug in apps/storefront/src/lib/util/order-slug.ts.
        order_slug: order.id.replace(/^order_/, ""),
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
        ...(invoiceAttachment ? { attachments: [invoiceAttachment] } : {}),
      },
    });

    logger.info(`Email confirmare trimis pentru comanda ${order.id}`);
  } catch (error) {
    // Not rethrown on purpose: `createNotifications` can fail after the
    // provider already accepted the message, so retrying would risk sending a
    // second confirmation (with a second invoice attachment) to the customer.
    logger.error(
      `Eroare la trimiterea emailului de confirmare pentru ${data.id}: ${String((error as Error)?.message ?? error)}`,
    );
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
