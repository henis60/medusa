import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];
  const romaniaCountries = ["ro"];

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Default Sales Channel",
          description: "Created by Medusa",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Default Publishable API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  const {
    result: [store],
  } = await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Default Store",
          supported_currencies: [
            {
              currency_code: "eur",
              is_default: true,
            },
            {
              currency_code: "usd",
              is_default: false,
            },
            {
              currency_code: "ron",
              is_default: false,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries,
          payment_providers: ["pp_system_default"],
        },
        {
          name: "Romania",
          currency_code: "ron",
          countries: romaniaCountries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  const romaniaRegion = regionResult[1];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: [...countries, ...romaniaCountries].map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "European Warehouse",
          address: {
            city: "Copenhagen",
            country_code: "DK",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  // This is created by a migration script in core.
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "European Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Europe",
        geo_zones: [
          {
            country_code: "gb",
            type: "country",
          },
          {
            country_code: "de",
            type: "country",
          },
          {
            country_code: "dk",
            type: "country",
          },
          {
            country_code: "se",
            type: "country",
          },
          {
            country_code: "fr",
            type: "country",
          },
          {
            country_code: "es",
            type: "country",
          },
          {
            country_code: "it",
            type: "country",
          },
          {
            country_code: "ro",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            currency_code: "ron",
            amount: 50,
          },
          {
            region_id: region.id,
            amount: 10,
          },
          {
            region_id: romaniaRegion.id,
            amount: 50,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            currency_code: "ron",
            amount: 50,
          },
          {
            region_id: region.id,
            amount: 10,
          },
          {
            region_id: romaniaRegion.id,
            amount: 50,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });
  logger.info("Finished seeding stock location data.");

  const STOREFRONT_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Suits",
          is_active: true,
        },
        {
          name: "Jackets",
          is_active: true,
        },
        {
          name: "Trousers",
          is_active: true,
        },
        {
          name: "Made to Measure",
          is_active: true,
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "The Caledonian Suit",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Suits")!.id,
          ],
          description:
            "Tailored from the finest Scottish tweed, The Caledonian Suit embodies the timeless elegance of the British countryside. Each suit is hand-finished by our master tailors in Bucharest, with surgeon's cuffs, canvas interlining, and a silhouette shaped to the modern hunter gentleman.",
          handle: "caledonian-suit",
          weight: 1200,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            { url: `${STOREFRONT_URL}/products/suit-1.webp` },
            { url: `${STOREFRONT_URL}/products/suit-2.webp` },
          ],
          options: [
            {
              title: "Size",
              values: ["46", "48", "50", "52", "54"],
            },
          ],
          variants: [
            {
              title: "46",
              sku: "HH-SUIT-CAL-46",
              options: { Size: "46" },
              prices: [
                { amount: 189000, currency_code: "eur" },
                { amount: 209000, currency_code: "usd" },
                { amount: 940000, currency_code: "ron" },
              ],
            },
            {
              title: "48",
              sku: "HH-SUIT-CAL-48",
              options: { Size: "48" },
              prices: [
                { amount: 189000, currency_code: "eur" },
                { amount: 209000, currency_code: "usd" },
                { amount: 940000, currency_code: "ron" },
              ],
            },
            {
              title: "50",
              sku: "HH-SUIT-CAL-50",
              options: { Size: "50" },
              prices: [
                { amount: 189000, currency_code: "eur" },
                { amount: 209000, currency_code: "usd" },
                { amount: 940000, currency_code: "ron" },
              ],
            },
            {
              title: "52",
              sku: "HH-SUIT-CAL-52",
              options: { Size: "52" },
              prices: [
                { amount: 189000, currency_code: "eur" },
                { amount: 209000, currency_code: "usd" },
                { amount: 940000, currency_code: "ron" },
              ],
            },
            {
              title: "54",
              sku: "HH-SUIT-CAL-54",
              options: { Size: "54" },
              prices: [
                { amount: 189000, currency_code: "eur" },
                { amount: 209000, currency_code: "usd" },
                { amount: 940000, currency_code: "ron" },
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Estate Hunting Jacket",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Jackets")!.id,
          ],
          description:
            "The Estate Hunting Jacket draws inspiration from the classic Norfolk silhouette, reimagined for the discerning modern sportsman. Crafted in a durable yet supple Loro Piana wool blend, it features bellows pockets, a belted back, and a split rear vent for unrestricted movement across the moor.",
          handle: "estate-hunting-jacket",
          weight: 900,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            { url: `${STOREFRONT_URL}/products/product-1a.webp` },
            { url: `${STOREFRONT_URL}/products/product-1b.webp` },
          ],
          options: [
            {
              title: "Size",
              values: ["46", "48", "50", "52", "54"],
            },
          ],
          variants: [
            {
              title: "46",
              sku: "HH-JKT-EST-46",
              options: { Size: "46" },
              prices: [
                { amount: 129000, currency_code: "eur" },
                { amount: 145000, currency_code: "usd" },
                { amount: 645000, currency_code: "ron" },
              ],
            },
            {
              title: "48",
              sku: "HH-JKT-EST-48",
              options: { Size: "48" },
              prices: [
                { amount: 129000, currency_code: "eur" },
                { amount: 145000, currency_code: "usd" },
                { amount: 645000, currency_code: "ron" },
              ],
            },
            {
              title: "50",
              sku: "HH-JKT-EST-50",
              options: { Size: "50" },
              prices: [
                { amount: 129000, currency_code: "eur" },
                { amount: 145000, currency_code: "usd" },
                { amount: 645000, currency_code: "ron" },
              ],
            },
            {
              title: "52",
              sku: "HH-JKT-EST-52",
              options: { Size: "52" },
              prices: [
                { amount: 129000, currency_code: "eur" },
                { amount: 145000, currency_code: "usd" },
                { amount: 645000, currency_code: "ron" },
              ],
            },
            {
              title: "54",
              sku: "HH-JKT-EST-54",
              options: { Size: "54" },
              prices: [
                { amount: 129000, currency_code: "eur" },
                { amount: 145000, currency_code: "usd" },
                { amount: 645000, currency_code: "ron" },
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "The Vânătoare Overcoat",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Jackets")!.id,
          ],
          description:
            "Named after the Romanian word for hunt, The Vânătoare Overcoat is our signature piece — a long, structured coat in charcoal herringbone that transitions seamlessly from the field to the salon. Double-breasted with a peak lapel, it is lined in Bemberg silk and finished with horn buttons sourced from the Carpathian highlands.",
          handle: "vanatoare-overcoat",
          weight: 1400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            { url: `${STOREFRONT_URL}/products/product-2a.webp` },
            { url: `${STOREFRONT_URL}/products/product-2b.webp` },
          ],
          options: [
            {
              title: "Size",
              values: ["46", "48", "50", "52", "54"],
            },
          ],
          variants: [
            {
              title: "46",
              sku: "HH-OC-VAN-46",
              options: { Size: "46" },
              prices: [
                { amount: 229000, currency_code: "eur" },
                { amount: 259000, currency_code: "usd" },
                { amount: 1145000, currency_code: "ron" },
              ],
            },
            {
              title: "48",
              sku: "HH-OC-VAN-48",
              options: { Size: "48" },
              prices: [
                { amount: 229000, currency_code: "eur" },
                { amount: 259000, currency_code: "usd" },
                { amount: 1145000, currency_code: "ron" },
              ],
            },
            {
              title: "50",
              sku: "HH-OC-VAN-50",
              options: { Size: "50" },
              prices: [
                { amount: 229000, currency_code: "eur" },
                { amount: 259000, currency_code: "usd" },
                { amount: 1145000, currency_code: "ron" },
              ],
            },
            {
              title: "52",
              sku: "HH-OC-VAN-52",
              options: { Size: "52" },
              prices: [
                { amount: 229000, currency_code: "eur" },
                { amount: 259000, currency_code: "usd" },
                { amount: 1145000, currency_code: "ron" },
              ],
            },
            {
              title: "54",
              sku: "HH-OC-VAN-54",
              options: { Size: "54" },
              prices: [
                { amount: 229000, currency_code: "eur" },
                { amount: 259000, currency_code: "usd" },
                { amount: 1145000, currency_code: "ron" },
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Highland Tweed Trousers",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Trousers")!.id,
          ],
          description:
            "Cut from the same Scottish tweed as The Caledonian Suit, the Highland Tweed Trousers are available as a separates purchase for those who require additional pairs. A flat-front silhouette with side adjusters and a full canvas waistband delivers an immaculate drape through the thigh and a clean break at the shoe.",
          handle: "highland-tweed-trousers",
          weight: 600,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            { url: `${STOREFRONT_URL}/products/product-3a.webp` },
            { url: `${STOREFRONT_URL}/products/product-3b.webp` },
          ],
          options: [
            {
              title: "Waist",
              values: ["30", "32", "34", "36", "38"],
            },
          ],
          variants: [
            {
              title: "30",
              sku: "HH-TRS-HLD-30",
              options: { Waist: "30" },
              prices: [
                { amount: 69000, currency_code: "eur" },
                { amount: 79000, currency_code: "usd" },
                { amount: 345000, currency_code: "ron" },
              ],
            },
            {
              title: "32",
              sku: "HH-TRS-HLD-32",
              options: { Waist: "32" },
              prices: [
                { amount: 69000, currency_code: "eur" },
                { amount: 79000, currency_code: "usd" },
                { amount: 345000, currency_code: "ron" },
              ],
            },
            {
              title: "34",
              sku: "HH-TRS-HLD-34",
              options: { Waist: "34" },
              prices: [
                { amount: 69000, currency_code: "eur" },
                { amount: 79000, currency_code: "usd" },
                { amount: 345000, currency_code: "ron" },
              ],
            },
            {
              title: "36",
              sku: "HH-TRS-HLD-36",
              options: { Waist: "36" },
              prices: [
                { amount: 69000, currency_code: "eur" },
                { amount: 79000, currency_code: "usd" },
                { amount: 345000, currency_code: "ron" },
              ],
            },
            {
              title: "38",
              sku: "HH-TRS-HLD-38",
              options: { Waist: "38" },
              prices: [
                { amount: 69000, currency_code: "eur" },
                { amount: 79000, currency_code: "usd" },
                { amount: 345000, currency_code: "ron" },
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
      ],
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 1000000,
        inventory_item_id: item.id,
      })),
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
