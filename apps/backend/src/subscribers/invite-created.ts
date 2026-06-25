import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

export default async function sendAdminInviteEmail({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  logger.info(`Sending admin invite email for invite: ${data.id}`)

  try {
    const query = container.resolve("query")
    const { data: invites } = await query.graph({
      entity: "invite",
      fields: ["id", "email", "token", "expires_at"],
      filters: { id: data.id },
    })

    if (!invites?.length) {
      logger.error(`Invite ${data.id} not found, skipping invite email`)
      return
    }

    const invite = invites[0]
    const notificationService = container.resolve("notification")

    await notificationService.createNotifications({
      to: invite.email,
      template: "admin-invite",
      channel: "email",
      data: {
        invite_token: invite.token,
        expires_at: invite.expires_at,
        invite_url: `${process.env.BACKEND_URL}/app/invite?token=${invite.token}`,
      },
    })

    logger.info(`Admin invite email sent to ${invite.email}`)
  } catch (error) {
    logger.error(
      `Failed to send admin invite email for ${data.id}: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "invite.created",
}
