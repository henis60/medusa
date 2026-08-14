"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

// The newsletter endpoints identify the subscriber from their session rather
// than from a caller-supplied address, so every call has to travel with the
// customer's auth header. That means these run server-side: the JWT lives in an
// httpOnly cookie the browser can't read, so a client fetch would arrive
// anonymous and be rejected.

// Server-side lookup so the overview page renders the newsletter box
// together with the rest of the page (the old client-side fetch made the
// box pop in after load). Always fresh — subscription can be toggled from
// the client without going through Next's cache.
export const getNewsletterSubscription = async (): Promise<boolean> => {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) return false

  return sdk.client
    .fetch<{ subscribed?: boolean }>(`/store/newsletter`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then((d) => d.subscribed ?? false)
    .catch(() => false)
}

export const subscribeToNewsletter = async (): Promise<{
  success: boolean
  error?: string
}> => {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return { success: false, error: "Autentificare necesară" }
  }

  try {
    await sdk.client.fetch(`/store/newsletter`, {
      method: "POST",
      headers,
      body: {},
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: resolveError(error) }
  }
}

export const unsubscribeFromNewsletter = async (): Promise<{
  success: boolean
  error?: string
}> => {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return { success: false, error: "Autentificare necesară" }
  }

  try {
    await sdk.client.fetch(`/store/newsletter`, {
      method: "DELETE",
      headers,
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: resolveError(error) }
  }
}

// The SDK's FetchError carries `.status` and folds the response body into
// `.message`. These routes answer with `{ error }` rather than `{ message }`,
// so the backend's own text doesn't survive the SDK — the caller falls back to
// its own translated string when this returns undefined, which keeps the
// message in the user's locale instead of hardcoding Romanian here.
const resolveError = (error: unknown): string | undefined => {
  const status = (error as { status?: number })?.status
  if (status === 429) {
    return "Prea multe încercări. Te rugăm să revii peste câteva minute."
  }
  return undefined
}
