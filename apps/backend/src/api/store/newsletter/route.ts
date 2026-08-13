import {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { BrevoClient } from "@getbrevo/brevo";
import { z } from "zod";

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });
const LIST_ID = parseInt(process.env.BREVO_NEWSLETTER_LIST_ID || "0", 10);

// `email` is only read for anonymous subscribes — a logged-in caller's address
// comes from their session, so the body is allowed to omit it.
const NewsletterSchema = z.object({
  email: z.string().email("Email invalid").optional(),
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

/**
 * Email of the logged-in customer, or null when the caller is anonymous.
 *
 * Subscription state is per-address, so every operation that reads or changes
 * it must act on an address the caller has proven they own. Taking the address
 * from the session rather than the request body is what stops one visitor
 * checking or cancelling another person's subscription.
 */
async function getAuthenticatedEmail(
  req: MedusaRequest | AuthenticatedMedusaRequest
): Promise<string | null> {
  // `allowUnauthenticated` means auth_context is absent for anonymous callers.
  const customerId = (req as AuthenticatedMedusaRequest).auth_context?.actor_id;
  if (!customerId) return null;

  try {
    const customerModule = req.scope.resolve(Modules.CUSTOMER);
    const customer = await customerModule.retrieveCustomer(customerId, {
      select: ["email"],
    });
    return customer?.email ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // Always the caller's own address — passing ?email= used to let anyone probe
  // whether an arbitrary address was on the list.
  const email = await getAuthenticatedEmail(req);
  if (!email) {
    return res.status(401).json({ error: "Autentificare necesară" });
  }

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

  const logger = req.scope.resolve("logger");

  // A logged-in customer subscribing their own address is already vouched for
  // by their session, so they skip the challenge. This used to key off
  // `?account=true`, which is attacker-controlled query input rather than proof
  // of anything — appending it bypassed the anti-spam gate entirely.
  const authenticatedEmail = await getAuthenticatedEmail(req);

  let email: string;
  if (authenticatedEmail) {
    email = authenticatedEmail;
  } else {
    const { recaptchaToken } = parsed.data;
    if (!recaptchaToken) {
      return res.status(400).json({ error: "Token reCAPTCHA lipsă" });
    }
    const isHuman = await verifyRecaptcha(recaptchaToken, logger);
    if (!isHuman) {
      return res
        .status(400)
        .json({ error: "Verificare anti-spam eșuată. Încearcă din nou." });
    }
    if (!parsed.data.email) {
      return res.status(400).json({ error: "Email invalid" });
    }
    email = parsed.data.email;
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
  // Own address only: this previously accepted any email in the body with no
  // authentication, so anyone could unsubscribe anyone.
  const email = await getAuthenticatedEmail(req);
  if (!email) {
    return res.status(401).json({ error: "Autentificare necesară" });
  }

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
