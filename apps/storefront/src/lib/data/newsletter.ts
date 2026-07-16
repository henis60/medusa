"use server"

import { sdk } from "@lib/config"

// Server-side lookup so the overview page renders the newsletter box
// together with the rest of the page (the old client-side fetch made the
// box pop in after load). Always fresh — subscription can be toggled from
// the client without going through Next's cache.
export const getNewsletterSubscription = async (
  email: string
): Promise<boolean> => {
  return sdk.client
    .fetch<{ subscribed?: boolean }>(`/store/newsletter`, {
      method: "GET",
      query: { email },
      cache: "no-store",
    })
    .then((d) => d.subscribed ?? false)
    .catch(() => false)
}
