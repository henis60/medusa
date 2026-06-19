import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils"
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function ({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const STOREFRONT_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"

  const { data: salesChannels } = await query.graph({ entity: "sales_channel", fields: ["id"] })
  const defaultSalesChannel = salesChannels[0]

  const { data: shippingProfiles } = await query.graph({ entity: "shipping_profile", fields: ["id"] })
  const shippingProfile = shippingProfiles[0]

  const { data: stockLocations } = await query.graph({ entity: "stock_location", fields: ["id"] })
  const stockLocation = stockLocations[0]

  // Categories — create only missing ones
  logger.info("Seeding product categories...")
  const categoryNames = ["Suits", "Jackets", "Trousers", "Made to Measure"]
  const { data: existingCats } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
    filters: { name: categoryNames },
  })
  const missingNames = categoryNames.filter((n) => !existingCats.find((c: any) => c.name === n))
  if (missingNames.length) {
    const { result: created } = await createProductCategoriesWorkflow(container).run({
      input: { product_categories: missingNames.map((name) => ({ name, is_active: true })) },
    })
    existingCats.push(...(created as any[]))
  }
  const catId = (name: string) => existingCats.find((c: any) => c.name === name)!.id

  // Products — create only missing ones
  logger.info("Seeding products...")
  const allProducts = [
    {
      title: "The Caledonian Suit",
      handle: "caledonian-suit",
      category_ids: [catId("Suits")],
      description:
        "Tailored from the finest Scottish tweed, The Caledonian Suit embodies the timeless elegance of the British countryside. Each suit is hand-finished by our master tailors in Bucharest, with surgeon's cuffs, canvas interlining, and a silhouette shaped to the modern hunter gentleman.",
      weight: 1200,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        { url: `${STOREFRONT_URL}/products/suit-1.webp` },
        { url: `${STOREFRONT_URL}/products/suit-2.webp` },
      ],
      options: [{ title: "Size", values: ["46", "48", "50", "52", "54"] }],
      variants: ["46", "48", "50", "52", "54"].map((size) => ({
        title: size,
        sku: `HH-SUIT-CAL-${size}`,
        options: { Size: size },
        prices: [
          { amount: 189000, currency_code: "eur" },
          { amount: 209000, currency_code: "usd" },
        ],
      })),
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
    {
      title: "Estate Hunting Jacket",
      handle: "estate-hunting-jacket",
      category_ids: [catId("Jackets")],
      description:
        "The Estate Hunting Jacket draws inspiration from the classic Norfolk silhouette, reimagined for the discerning modern sportsman. Crafted in a durable yet supple Loro Piana wool blend, it features bellows pockets, a belted back, and a split rear vent for unrestricted movement across the moor.",
      weight: 900,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        { url: `${STOREFRONT_URL}/products/product-1a.webp` },
        { url: `${STOREFRONT_URL}/products/product-1b.webp` },
      ],
      options: [{ title: "Size", values: ["46", "48", "50", "52", "54"] }],
      variants: ["46", "48", "50", "52", "54"].map((size) => ({
        title: size,
        sku: `HH-JKT-EST-${size}`,
        options: { Size: size },
        prices: [
          { amount: 129000, currency_code: "eur" },
          { amount: 145000, currency_code: "usd" },
        ],
      })),
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
    {
      title: "The Vânătoare Overcoat",
      handle: "vanatoare-overcoat",
      category_ids: [catId("Jackets")],
      description:
        "Named after the Romanian word for hunt, The Vânătoare Overcoat is our signature piece — a long, structured coat in charcoal herringbone that transitions seamlessly from the field to the salon. Double-breasted with a peak lapel, lined in Bemberg silk with horn buttons sourced from the Carpathian highlands.",
      weight: 1400,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        { url: `${STOREFRONT_URL}/products/product-2a.webp` },
        { url: `${STOREFRONT_URL}/products/product-2b.webp` },
      ],
      options: [{ title: "Size", values: ["46", "48", "50", "52", "54"] }],
      variants: ["46", "48", "50", "52", "54"].map((size) => ({
        title: size,
        sku: `HH-OC-VAN-${size}`,
        options: { Size: size },
        prices: [
          { amount: 229000, currency_code: "eur" },
          { amount: 259000, currency_code: "usd" },
        ],
      })),
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
    {
      title: "Highland Tweed Trousers",
      handle: "highland-tweed-trousers",
      category_ids: [catId("Trousers")],
      description:
        "Cut from the same Scottish tweed as The Caledonian Suit, the Highland Tweed Trousers are available as a separates purchase. A flat-front silhouette with side adjusters and a full canvas waistband delivers an immaculate drape through the thigh and a clean break at the shoe.",
      weight: 600,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        { url: `${STOREFRONT_URL}/products/product-3a.webp` },
        { url: `${STOREFRONT_URL}/products/product-3b.webp` },
      ],
      options: [{ title: "Waist", values: ["30", "32", "34", "36", "38"] }],
      variants: ["30", "32", "34", "36", "38"].map((waist) => ({
        title: waist,
        sku: `HH-TRS-HLD-${waist}`,
        options: { Waist: waist },
        prices: [
          { amount: 69000, currency_code: "eur" },
          { amount: 79000, currency_code: "usd" },
        ],
      })),
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
  ]

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["handle"],
    filters: { handle: allProducts.map((p) => p.handle) },
  })
  const existingHandles = new Set(existingProducts.map((p: any) => p.handle))
  const newProducts = allProducts.filter((p) => !existingHandles.has(p.handle))

  if (newProducts.length) {
    await createProductsWorkflow(container).run({ input: { products: newProducts as any } })
    logger.info(`Created ${newProducts.length} product(s).`)
  } else {
    logger.info("All products already exist, skipping.")
  }

  // Inventory — only for items without a level at this location
  logger.info("Seeding inventory levels...")
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "location_levels.location_id"],
  })
  const newItems = inventoryItems.filter(
    (item) => !(item.location_levels ?? []).some((l: any) => l.location_id === stockLocation.id)
  )
  if (newItems.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: newItems.map((item) => ({
          location_id: stockLocation.id,
          stocked_quantity: 100,
          inventory_item_id: item.id,
        })),
      },
    })
    logger.info(`Created inventory levels for ${newItems.length} item(s).`)
  } else {
    logger.info("All inventory levels already exist, skipping.")
  }

  logger.info("Done.")
}
