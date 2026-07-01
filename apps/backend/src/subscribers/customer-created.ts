import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";

export default async function sendWelcomeEmail({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");
  logger.info(`Sending welcome email for customer: ${data.id}`);

  try {
    const query = container.resolve("query");
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "email", "first_name", "last_name"],
      filters: { id: data.id },
    });

    if (!customers?.length) {
      logger.error(`Customer ${data.id} not found, skipping welcome email`);
      return;
    }

    const customer = customers[0];

    if (!customer.email) {
      logger.error(`Customer ${data.id} has no email, skipping welcome email`);
      return;
    }

    const notificationService = container.resolve("notification");

    await notificationService.createNotifications({
      to: customer.email,
      template: "8",
      channel: "email",
      data: {
        first_name: customer.first_name ?? "",
        email: customer.email,
        storefront_url: process.env.VITE_STOREFRONT_URL,
      },
    });

    logger.info(`Welcome email sent to ${customer.email}`);
  } catch (error) {
    logger.error(
      `Failed to send welcome email for customer ${data.id}: ${String(error?.message ?? error)}`,
    );
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
};
