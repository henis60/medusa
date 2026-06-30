import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";
import { capturePaymentWorkflow } from "@medusajs/core-flows";
import { createOblioInvoiceWorkflow } from "../workflows/create-oblio-invoice";

export default async function sendOrderConfirmationEmail({
  event: { data, eventName },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");
  logger.info(`Trimitere email confirmare pentru comanda: ${data.id}`);

  // Auto-capture plată la plasarea comenzii
  if (eventName === "order.placed") {
    try {
      const query = container.resolve("query")
      const { data: orders } = await query.graph({
        entity: "order",
        fields: ["payment_collections.id", "payment_collections.payments.id"],
        filters: { id: data.id },
      })
      const payments = orders?.[0]?.payment_collections?.flatMap((pc: any) => pc.payments ?? []) ?? []
      for (const payment of payments) {
        await capturePaymentWorkflow(container).run({ input: { payment_id: payment.id } })
        logger.info(`Plată ${payment.id} capturată automat pentru comanda ${data.id}`)
      }
    } catch (err) {
      logger.error(`Auto-capture eșuat pentru comanda ${data.id}: ${(err as Error).message}`)
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
      const { result } = await createOblioInvoiceWorkflow(container).run({
        input: { order_id: data.id },
      })
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

    logger.info(`Email confirmare trimis la ${order.email}`);
  } catch (error) {
    logger.error(
      `Eroare la trimiterea emailului de confirmare pentru ${data.id}: ${String((error as Error)?.message ?? error)}`,
    );
  }
}

export const config: SubscriberConfig = {
  event: ["order.placed", "order.completed"],
};
