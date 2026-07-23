import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";

function decodeJwtPayload(token: string): Record<string, any> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
  } catch {
    return {};
  }
}

function formatExpiry(exp: number): string {
  const d = new Date(exp * 1000);
  return d.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Bucharest",
  });
}

export default async function sendPasswordResetEmail({
  event: { data },
  container,
}: SubscriberArgs<{ token: string }>) {
  const logger = container.resolve("logger");

  const payload = decodeJwtPayload(data.token);
  const email = payload.entity_id as string | undefined;

  if (!email) {
    logger.error("Password reset event: could not extract email from token");
    return;
  }

  logger.info(`Sending password reset email to: ${email}`);

  try {
    const notificationService = container.resolve("notification");

    await notificationService.createNotifications({
      to: email,
      template: "7",
      channel: "email",
      data: {
        email,
        token: data.token,
        token_expiry_at: payload.exp ? formatExpiry(payload.exp) : "—",
        storefront_url: process.env.VITE_STOREFRONT_URL,
      },
    });

    logger.info(`Password reset email sent to ${email}`);
  } catch (error) {
    logger.error(
      `Failed to send password reset email to ${email}: ${String(error?.message ?? error)}`,
    );
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
};
