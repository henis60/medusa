import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BrevoClient } from "@getbrevo/brevo"
import { z } from "zod"

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! })

const NewsletterSchema = z.object({
  email: z.string().email("Email invalid"),
  recaptchaToken: z.string().min(1, "Token reCAPTCHA lipsă"),
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
  logger?.info(`reCAPTCHA response: ${JSON.stringify(data)}`)
  return data.success && data.score >= 0.5
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = NewsletterSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message })
  }

  const { email, recaptchaToken } = parsed.data
  const logger = req.scope.resolve("logger")

  const isHuman = await verifyRecaptcha(recaptchaToken, logger)
  if (!isHuman) {
    return res.status(400).json({ error: "Verificare anti-spam eșuată. Încearcă din nou." })
  }

  try {
    const listId = parseInt(process.env.BREVO_NEWSLETTER_LIST_ID || "0", 10)

    await client.contacts.createContact({
      email,
      listIds: listId > 0 ? [listId] : [],
      updateEnabled: true,
    })

    logger.info(`Newsletter subscription: ${email}`)
    return res.status(200).json({ success: true })
  } catch (error) {
    if (error?.statusCode === 400 && (error?.message?.includes("Contact already exist") || error?.message?.includes("duplicate"))) {
      return res.status(200).json({ success: true })
    }
    logger.error(`Newsletter subscribe error: ${error.message}`)
    return res.status(500).json({ error: "Abonarea a eșuat. Încearcă din nou." })
  }
}
