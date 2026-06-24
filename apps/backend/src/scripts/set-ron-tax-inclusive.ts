import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
} from "@medusajs/framework/utils"

/**
 * Sets includes_tax=true on all RON prices so that the stored price is
 * treated as tax-inclusive (TVA is extracted from the price, not added on top).
 *
 * Run once with: npx medusa exec src/scripts/set-ron-tax-inclusive.ts
 */
export default async function setRonTaxInclusive({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pricingService = container.resolve(ModuleRegistrationName.PRICING)

  logger.info("Fetching all RON prices...")

  const prices = await pricingService.listPrices(
    { currency_code: "ron" },
    { select: ["id", "currency_code", "amount", "includes_tax"] }
  )

  if (!prices.length) {
    logger.info("No RON prices found — nothing to update.")
    return
  }

  logger.info(`Found ${prices.length} RON prices. Setting includes_tax=true...`)

  await pricingService.updatePrices(
    prices.map((p) => ({ id: p.id, includes_tax: true }))
  )

  logger.info(
    `Done. ${prices.length} prices updated to tax-inclusive. TVA will now be extracted from the product price, not added on top.`
  )
}
