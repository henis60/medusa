import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

/**
 * When a product is created/updated/deleted, ping the storefront's
 * revalidation endpoint so it drops cached product data without a redeploy.
 * Needs VITE_STOREFRONT_URL + REVALIDATE_SECRET set on the backend.
 */

// The endpoint purges the whole product cache, so N events in a burst and one
// event need exactly the same single call. Without coalescing a bulk import
// (one event per product, times ~12 subscribed event types) hammered the
// storefront with hundreds of identical requests.
//
// Trailing debounce: each event pushes the call out by DEBOUNCE_MS, but never
// past MAX_WAIT_MS after the first event of the burst, so a long import still
// gets intermediate refreshes instead of one at the very end. A single edit
// waits only DEBOUNCE_MS.
const DEBOUNCE_MS = 1_500
const MAX_WAIT_MS = 15_000

type Pending = {
  promise: Promise<void>
  resolve: () => void
  reject: (error: unknown) => void
  timer: NodeJS.Timeout
  firstQueuedAt: number
}

let pending: Pending | null = null

async function callRevalidate(base: string, secret: string): Promise<Response> {
  return fetch(`${base}/api/revalidate?secret=${encodeURIComponent(secret)}`, {
    method: "POST",
  })
}

function scheduleRevalidate(
  base: string,
  secret: string,
  logger: { info: (m: string) => void; warn: (m: string) => void }
): Promise<void> {
  const now = Date.now()

  if (pending) {
    // Extend the window unless that would push us past the hard cap.
    if (now - pending.firstQueuedAt + DEBOUNCE_MS <= MAX_WAIT_MS) {
      clearTimeout(pending.timer)
      pending.timer = setTimeout(fire, DEBOUNCE_MS)
    }
    return pending.promise
  }

  let resolve!: () => void
  let reject!: (error: unknown) => void
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })

  pending = {
    promise,
    resolve,
    reject,
    firstQueuedAt: now,
    timer: setTimeout(fire, DEBOUNCE_MS),
  }

  return promise

  async function fire() {
    const current = pending
    pending = null
    if (!current) return

    try {
      const res = await callRevalidate(base, secret)
      if (!res.ok) {
        // A non-2xx is usually transient (storefront redeploying, cold start),
        // so surface it as a rejection: every event coalesced into this call
        // rethrows, letting the event bus retry instead of leaving the
        // storefront serving stale data with only a warning in the log.
        current.reject(
          new Error(`Storefront revalidation returned ${res.status}`)
        )
        return
      }
      logger.info("Storefront revalidation triggered")
      current.resolve()
    } catch (e: any) {
      current.reject(e)
    }
  }
}

export default async function revalidateStorefront({
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const base = process.env.VITE_STOREFRONT_URL
  const secret = process.env.REVALIDATE_SECRET

  if (!base || !secret) {
    return // not configured — skip silently
  }

  try {
    await scheduleRevalidate(base, secret, logger)
  } catch (e: any) {
    // Retrying is safe here: revalidation is idempotent and has no
    // customer-visible side effect (unlike the email subscribers), so let the
    // event bus retry a transient network/storefront failure.
    logger.warn(`Storefront revalidation failed: ${e.message}`)
    throw e
  }
}

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
    "product-category.created",
    "product-category.updated",
    "product-category.deleted",
    "product-collection.created",
    "product-collection.updated",
    "product-collection.deleted",
    // Saving a translation (via the official /admin/translations/batch route)
    // doesn't touch the product/category/collection entity itself, so the
    // events above never fire for a translation-only change — these close
    // that gap.
    "translation.created",
    "translation.updated",
    "translation.deleted",
  ],
}
