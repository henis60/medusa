import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { BrevoClient } from "@getbrevo/brevo";
import { z } from "zod";

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });
const LIST_ID = parseInt(process.env.BREVO_NEWSLETTER_LIST_ID || "0", 10);

const NewsletterSchema = z.object({
  email: z.string().email("Email invalid"),
  recaptchaToken: z.string().optional(),
});

async function verifyRecaptcha(token: string, logger?: any): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return false;

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }).toString(),
  });

  const data = (await res.json()) as {
    success: boolean;
    score: number;
    "error-codes"?: string[];
  };
  logger?.info(`reCAPTCHA response: ${JSON.stringify(data)}`);
  return data.success && data.score >= 0.5;
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const response = await client.contacts.getContactInfo({
      identifier: email,
    });
    const data = (response as any).data ?? response;
    const isSubscribed = (data as any).listIds?.includes(LIST_ID) ?? false;
    return res.status(200).json({ subscribed: isSubscribed });
  } catch (error: any) {
    const status =
      error?.statusCode ?? error?.status ?? error?.response?.status;
    if (status === 404) {
      return res.status(200).json({ subscribed: false });
    }
    return res
      .status(500)
      .json({
        error: "Failed to check subscription",
        detail: String(error?.message ?? error),
      });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = NewsletterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { email, recaptchaToken } = parsed.data;
  const logger = req.scope.resolve("logger");
  const fromAccount = (req.query as any).account === "true";

  if (!fromAccount) {
    if (!recaptchaToken) {
      return res.status(400).json({ error: "Token reCAPTCHA lipsă" });
    }
    const isHuman = await verifyRecaptcha(recaptchaToken, logger);
    if (!isHuman) {
      return res
        .status(400)
        .json({ error: "Verificare anti-spam eșuată. Încearcă din nou." });
    }
  }

  try {
    await client.contacts.createContact({
      email,
      listIds: LIST_ID > 0 ? [LIST_ID] : [],
      updateEnabled: true,
    });

    logger.info(`Newsletter subscription: ${email}`);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    if (
      error?.statusCode === 400 &&
      (error?.message?.includes("Contact already exist") ||
        error?.message?.includes("duplicate"))
    ) {
      return res.status(200).json({ success: true });
    }
    logger.error(`Newsletter subscribe error: ${error.message}`);
    return res
      .status(500)
      .json({ error: "Abonarea a eșuat. Încearcă din nou." });
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { email } = req.body as { email: string };
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    await client.contacts.removeContactFromList({
      listId: LIST_ID,
      body: { emails: [email] },
    });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Dezabonarea a eșuat. Încearcă din nou." });
  }
}
