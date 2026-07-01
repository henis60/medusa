import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BrevoClient } from "@getbrevo/brevo"
import { z } from "zod"

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! })
const APPOINTMENTS_LIST_ID = 7

const ContactSchema = z.object({
  name: z.string().min(2, "Numele trebuie să aibă minim 2 caractere"),
  email: z.string().email("Email invalid"),
  message: z.string().min(10, "Mesajul trebuie să aibă minim 10 caractere").max(5000, "Mesajul este prea lung"),
  recaptchaToken: z.string().min(1, "Token reCAPTCHA lipsă"),
  type: z.enum(["contact", "appointment"]).optional(),
})

async function verifyRecaptcha(token: string, logger?: any): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) return false

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }).toString(),
  })

  const data = (await res.json()) as { success: boolean; score: number; "error-codes"?: string[] }
  logger?.info(`reCAPTCHA contact response: ${JSON.stringify(data)}`)
  return data.success && data.score >= 0.5
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = ContactSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message })
  }

  const { name, email, message, recaptchaToken, type } = parsed.data
  const logger = req.scope.resolve("logger")

  const isHuman = await verifyRecaptcha(recaptchaToken, logger)
  if (!isHuman) {
    return res.status(400).json({ error: "Verificare anti-spam eșuată. Încearcă din nou." })
  }

  try {
    const notificationService = req.scope.resolve("notification")

    await notificationService.createNotifications({
      to: process.env.CONTACT_RECIPIENT_EMAIL || process.env.BREVO_FROM_EMAIL!,
      template: type === "appointment" ? "appointment-form" : "contact-form",
      channel: "email",
      data: { name, email, message },
    })

    logger.info(`Contact form submission from ${email}`)

    if (type === "appointment") {
      const nameParts = name.trim().split(" ")
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(" ") || undefined
      try {
        await brevo.contacts.createContact({
          email,
          listIds: [APPOINTMENTS_LIST_ID],
          attributes: { FIRSTNAME: firstName, ...(lastName && { LASTNAME: lastName }) },
          updateEnabled: true,
        })
        logger.info(`Brevo: added ${email} to appointments list`)
      } catch (err: any) {
        logger.warn(`Brevo contact add failed: ${err.message}`)
      }
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    logger.error(`Contact form error: ${error.message}`)
    return res.status(500).json({ error: "Nu am putut trimite mesajul. Încearcă din nou." })
  }
}
