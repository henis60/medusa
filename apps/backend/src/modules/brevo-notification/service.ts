import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/types"
import { BrevoClient } from "@getbrevo/brevo"
import { randomUUID } from "crypto"

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

type BrevoOptions = {
  apiKey: string
  from: string
  fromName?: string
}

type InjectedDependencies = {
  logger: { info: (msg: string) => void; error: (msg: string) => void }
}

class BrevoNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "brevo"

  private options: BrevoOptions
  private logger: InjectedDependencies["logger"]
  private client: BrevoClient

  constructor({ logger }: InjectedDependencies, options: BrevoOptions) {
    super()
    this.options = options
    this.logger = logger

    if (!options.apiKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Brevo notification provider requires an API key (BREVO_API_KEY)"
      )
    }

    this.client = new BrevoClient({ apiKey: options.apiKey })
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const { to, template, data, from } = notification

    const senderEmail = from || this.options.from
    const senderName = this.options.fromName

    const templateId = parseInt(template as string, 10)

    try {
      let messageId: string | undefined

      if (!isNaN(templateId) && templateId > 0) {
        const result = await this.client.transactionalEmails.sendTransacEmail({
          to: [{ email: to }],
          sender: { email: senderEmail, name: senderName },
          templateId,
          params: data as Record<string, unknown>,
        })
        messageId = result?.messageId
      } else {
        const { subject, htmlContent } = this.buildFallbackEmail(
          template as string,
          data as Record<string, unknown>
        )
        const result = await this.client.transactionalEmails.sendTransacEmail({
          to: [{ email: to }],
          sender: { email: senderEmail, name: senderName },
          subject,
          htmlContent,
          params: data as Record<string, unknown>,
        })
        messageId = result?.messageId
      }

      this.logger.info(`Brevo email sent to ${to}, template: ${template}`)
      return { id: messageId || randomUUID() }
    } catch (error) {
      this.logger.error(
        `Brevo failed to send email to ${to}: ${String(error?.message ?? error)}`
      )
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send email via Brevo: ${String(error?.message ?? error)}`
      )
    }
  }

  private buildFallbackEmail(
    template: string,
    data: Record<string, unknown>
  ): { subject: string; htmlContent: string } {
    const subjects: Record<string, string> = {
      "order-confirmation": `Confirmare comandă #${data.order_id || ""}`,
      "order-shipped": `Comanda ta #${data.order_id || ""} a fost expediată`,
      "password-reset": "Resetare parolă",
      "admin-invite": "Invitație administrator",
      "contact-form": `Mesaj nou de la ${data.name || data.email || "vizitator"}`,
    }

    const subject = subjects[template] || "Notificare magazin"
    const htmlContent = this.buildHtmlBody(template, subject, data);

    return { subject, htmlContent }
  }

  private buildHtmlBody(
    template: string,
    subject: string,
    data: Record<string, unknown>
  ): string {
    const brand = this.options.fromName || this.options.from

    if (template === "contact-form") {
      const safeName = escapeHtml(data.name)
      const safeEmail = escapeHtml(data.email)
      const safeMessage = escapeHtml(data.message)
      return `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
          <div style="background:#1a1a1a;padding:24px 32px;">
            <p style="margin:0;color:#c9a84c;font-size:11px;letter-spacing:3px;text-transform:uppercase;">${brand}</p>
          </div>
          <div style="padding:32px;">
            <h2 style="margin:0 0 24px;font-size:18px;color:#1a1a1a;">Mesaj nou de pe site</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#888;font-size:12px;width:80px;">Nume</td>
                  <td style="padding:8px 0;color:#1a1a1a;font-size:14px;">${safeName}</td></tr>
              <tr><td style="padding:8px 0;color:#888;font-size:12px;">Email</td>
                  <td style="padding:8px 0;font-size:14px;"><a href="mailto:${safeEmail}" style="color:#c9a84c;">${safeEmail}</a></td></tr>
            </table>
            <div style="margin-top:24px;padding:16px;background:#f8f8f8;border-left:3px solid #c9a84c;">
              <p style="margin:0;font-size:14px;color:#333;line-height:1.6;white-space:pre-wrap;">${safeMessage}</p>
            </div>
            <p style="margin-top:24px;">
              <a href="mailto:${safeEmail}?subject=Re: Mesaj de pe site"
                 style="display:inline-block;padding:10px 24px;background:#c9a84c;color:#1a1a1a;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
                Răspunde
              </a>
            </p>
          </div>
          <div style="padding:16px 32px;background:#f8f8f8;border-top:1px solid #eee;">
            <p style="margin:0;color:#aaa;font-size:11px;">Mesaj primit prin formularul de contact de pe thehunter.ro</p>
          </div>
        </div>`
    }

    // Generic fallback for other templates
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#1a1a1a;">${subject}</h2>
        <pre style="background:#f5f5f5;padding:16px;font-size:13px;">${JSON.stringify(data, null, 2)}</pre>
        <p style="color:#aaa;font-size:11px;">Trimis de ${brand}</p>
      </div>`
  }
}

export default BrevoNotificationProviderService
