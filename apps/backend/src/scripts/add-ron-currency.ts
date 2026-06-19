import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  updateRegionsWorkflow,
} from "@medusajs/medusa/core-flows"

// RON prices mapped to EUR amounts (approx 5× EUR rate)
const RON_PRICES: Record<number, number> = {
  189000: 940000,
  129000: 645000,
  229000: 1145000,
  69000:  345000,
}
const RON_SHIPPING_AMOUNT = 50

export default async function ({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const storeModuleService = container.resolve(Modules.STORE)
  const pricingModuleService = container.resolve(Modules.PRICING)

  // ── 1. Add RON to store supported currencies ──────────────────────────────
  logger.info("Adding RON to store supported currencies...")
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "supported_currencies.currency_code", "supported_currencies.is_default"],
  })
  const store = stores[0]
  const hasCurrency = store.supported_currencies?.some(
    (c: any) => c.currency_code === "ron"
  )
  if (hasCurrency) {
    logger.info("RON already in store currencies, skipping.")
  } else {
    const existing = (store.supported_currencies ?? []).map((c: any) => ({
      currency_code: c.currency_code,
      is_default: c.is_default === true,
    }))
    await storeModuleService.updateStores(store.id, {
      supported_currencies: [
        ...existing,
        { currency_code: "ron", is_default: false },
      ],
    })
    logger.info("RON added to store.")
  }

  // ── 2. Create Romania region and ensure "ro" is assigned to it ───────────
  logger.info("Creating Romania region...")
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "countries.iso_2"],
  })
  const regionWithRo = existingRegions.find((r: any) =>
    r.countries?.some((c: any) => c.iso_2 === "ro")
  )
  let ronRegion = existingRegions.find((r: any) => r.currency_code === "ron")
  let regionId: string

  if (!ronRegion) {
    const countriesArg = regionWithRo ? [] : ["ro"]
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Romania",
            currency_code: "ron",
            countries: countriesArg,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    ronRegion = result[0] as any
    regionId = result[0].id
    logger.info(`Romania region created: ${regionId}`)
  } else {
    regionId = ronRegion.id
    logger.info("Romania RON region already exists.")
  }

  // Move "ro" into the Romania/RON region if it's currently in another region
  const roInRonRegion = (ronRegion as any).countries?.some((c: any) => c.iso_2 === "ro")
  if (!roInRonRegion) {
    if (regionWithRo && regionWithRo.id !== regionId) {
      // Remove "ro" from the current region
      const remainingCountries = (regionWithRo.countries ?? [])
        .filter((c: any) => c.iso_2 !== "ro")
        .map((c: any) => c.iso_2)
      await updateRegionsWorkflow(container).run({
        input: {
          regions: [{ id: regionWithRo.id, countries: remainingCountries }],
        },
      })
      logger.info(`Removed "ro" from region "${regionWithRo.name}".`)
    }
    // Add "ro" to the Romania/RON region
    const currentRoCountries = ((ronRegion as any).countries ?? []).map((c: any) => c.iso_2)
    await updateRegionsWorkflow(container).run({
      input: {
        regions: [{ id: regionId, countries: [...currentRoCountries, "ro"] }],
      },
    })
    logger.info(`"ro" assigned to Romania/RON region.`)
  } else {
    logger.info(`"ro" is already in the Romania/RON region.`)
  }

  // ── 3. Create Romania tax region (if missing) ─────────────────────────────
  logger.info("Creating Romania tax region...")
  const { data: existingTaxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
  })
  const hasRoTax = existingTaxRegions.some((t: any) => t.country_code === "ro")
  if (hasRoTax) {
    logger.info("Romania tax region already exists, skipping.")
  } else {
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: "ro", provider_id: "tp_system" }],
    })
    logger.info("Romania tax region created.")
  }

  // ── 4. Add RON prices to product variants ─────────────────────────────────
  logger.info("Adding RON prices to product variants...")
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "sku", "price_set.id", "price_set.prices.currency_code", "price_set.prices.amount"],
  })

  let addedCount = 0
  for (const variant of variants as any[]) {
    const priceSetId = variant.price_set?.id
    if (!priceSetId) continue

    const existingPrices: any[] = variant.price_set?.prices ?? []
    const hasRon = existingPrices.some((p: any) => p.currency_code === "ron")
    if (hasRon) continue

    // Find EUR price to derive RON amount
    const eurPrice = existingPrices.find((p: any) => p.currency_code === "eur")
    const ronAmount = eurPrice ? (RON_PRICES[eurPrice.amount] ?? Math.round(eurPrice.amount * 5)) : null
    if (!ronAmount) {
      logger.warn(`No EUR price found for variant ${variant.sku}, skipping RON price.`)
      continue
    }

    await pricingModuleService.addPrices([
      {
        priceSetId,
        prices: [{ currency_code: "ron", amount: ronAmount }],
      },
    ])
    addedCount++
  }
  logger.info(`RON prices added to ${addedCount} variant(s).`)

  // ── 5. Add RON shipping prices ────────────────────────────────────────────
  logger.info("Adding RON shipping prices...")
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const { data: soLinks } = await query.graph({
    entity: "shipping_option_price_set",
    fields: ["shipping_option_id", "price_set_id"],
  })

  let shippingUpdated = 0
  for (const soLink of soLinks as any[]) {
    const priceSetId = soLink.price_set_id
    if (!priceSetId) continue

    const [priceSet] = await pricingModuleService.listPriceSets(
      { id: [priceSetId] },
      { relations: ["prices"] }
    )
    const prices: any[] = (priceSet as any)?.prices ?? []
    if (prices.some((p: any) => p.currency_code === "ron")) continue

    await pricingModuleService.addPrices([
      {
        priceSetId,
        prices: [{ currency_code: "ron", amount: RON_SHIPPING_AMOUNT }],
      },
    ])
    shippingUpdated++
  }
  logger.info(`RON shipping prices added to ${shippingUpdated} shipping option(s).`)

  logger.info("Done — RON (Romanian Leu) fully added to the store.")
}
