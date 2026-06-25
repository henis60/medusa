import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

export default async function sendPasswordResetEmail({
  event: { data },
  container,
}: SubscriberArgs<{ email: string; token: string; token_expiry_at: string }>) {
  const logger = container.resolve("logger")
  logger.info(`Sending password reset email to: ${data.email}`)

  try {
    const notificationService = container.resolve("notification")

    await notificationService.createNotifications({
      to: data.email,
      template: "7",
      channel: "email",
      data: {
        email: data.email,
        token: data.token,
        token_expiry_at: data.token_expiry_at,
      },
    })

    logger.info(`Password reset email sent to ${data.email}`)
  } catch (error) {
    logger.error(
      `Failed to send password reset email to ${data.email}: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
