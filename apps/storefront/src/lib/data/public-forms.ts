"use server"

import { sdk } from "@lib/config"

// Formularele publice (contact, programare, newsletter) trimiteau `fetch`
// direct din browser către backend. Mutate aici, cererea pleacă de pe server,
// deci folosește rețeaua privată și nu mai trece prin Cloudflare — singurul
// trafic browser→Medusa care mai rămăsese.
//
// reCAPTCHA rămâne în client: tokenul se poate obține doar acolo, din widget.
// El e doar transportat prin acțiunile de mai jos.

export type PublicFormResult =
  | { success: true }
  // "rate_limited" e separat pentru că fiecare formular îi arată clientului un
  // mesaj propriu; `message` poartă textul backendului când acesta îl trimite.
  | { success: false; reason: "rate_limited" | "error"; message?: string }

type ContactPayload = {
  name: string
  email: string
  message: string
  type: "contact" | "appointment"
  recaptchaToken: string
}

export async function submitContactForm(
  payload: ContactPayload
): Promise<PublicFormResult> {
  return post("/store/contact", payload)
}

export async function submitNewsletterSignup(payload: {
  email: string
  recaptchaToken: string
}): Promise<PublicFormResult> {
  return post("/store/newsletter", payload)
}

async function post(
  path: string,
  body: Record<string, unknown>
): Promise<PublicFormResult> {
  try {
    await sdk.client.fetch(path, { method: "POST", body })
    return { success: true }
  } catch (error) {
    const status = (error as { status?: number })?.status

    if (status === 429) return { success: false, reason: "rate_limited" }

    // Rutele astea răspund cu `{ error }`, pe care SDK-ul îl pliază în
    // `message`. Îl pasăm mai departe doar dacă arată a text pentru om —
    // altfel apelantul își folosește propria traducere.
    const raw = (error as { message?: string })?.message
    const message =
      typeof raw === "string" && raw.length > 0 && raw.length < 200
        ? raw
        : undefined

    return { success: false, reason: "error", message }
  }
}
