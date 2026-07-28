import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

/**
 * Pings the storefront's on-demand revalidation endpoint, same mechanism as
 * src/subscribers/product-revalidate.ts. Translation upserts don't touch the
 * product/category/collection entities themselves, so that subscriber's
 * entity-change events never fire for a translation change — this step
 * closes that gap by triggering the same cache invalidation directly from
 * the translation workflows.
 */
export const revalidateStorefrontStep = createStep(
  "revalidate-storefront",
  async (_input: void, { container }) => {
    const logger = container.resolve("logger")
    const base = process.env.VITE_STOREFRONT_URL
    const secret = process.env.REVALIDATE_SECRET

    if (!base || !secret) {
      return new StepResponse(null)
    }

    try {
      const res = await fetch(
        `${base}/api/revalidate?secret=${encodeURIComponent(secret)}`,
        { method: "POST" }
      )
      if (!res.ok) {
        logger.warn(`Storefront revalidation returned ${res.status}`)
      }
    } catch (e: any) {
      logger.warn(`Storefront revalidation failed: ${e.message}`)
    }

    return new StepResponse(null)
  }
)
