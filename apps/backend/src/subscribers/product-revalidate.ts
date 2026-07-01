import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

/**
 * When a product is created/updated/deleted, ping the storefront's
 * revalidation endpoint so it drops cached product data without a redeploy.
 * Needs VITE_STOREFRONT_URL + REVALIDATE_SECRET set on the backend.
 */
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
    const res = await fetch(
      `${base}/api/revalidate?secret=${encodeURIComponent(secret)}`,
      { method: "POST" }
    )
    if (!res.ok) {
      logger.warn(`Storefront revalidation returned ${res.status}`)
    } else {
      logger.info("Storefront revalidation triggered")
    }
  } catch (e: any) {
    logger.warn(`Storefront revalidation failed: ${e.message}`)
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
  ],
}

