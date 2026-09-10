import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import { isMetadataFlagSet } from "@lib/util/metadata-flag"

const PRODUCT_FIELDS =
  "*variants.calculated_price,+variants.options,+variants.variant_rank,+options,+options.values,+images,+metadata,+categories.id,+categories.name,+categories.parent_category.id,+categories.parent_category.name"

// The shared parent category across a set of featured products (e.g. several
// tie/cufflink products under different subcategories that all roll up to
// "Accesorii") — used as the section title when there's no featured
// collection to name it instead. A category with no parent counts as its
// own "root", so a shared top-level category still matches.
function findCommonParentCategory(
  products: HttpTypes.StoreProduct[]
): { name: string } | null {
  const perProductRoots = products.map((product) => {
    const roots = new Map<string, string>()
    for (const cat of (product as any).categories ?? []) {
      const parent = cat.parent_category
      if (parent) roots.set(parent.id, parent.name)
      else roots.set(cat.id, cat.name)
    }
    return roots
  })
  if (!perProductRoots.length || perProductRoots.some((r) => r.size === 0)) {
    return null
  }
  let commonIds = new Set(perProductRoots[0].keys())
  for (const roots of perProductRoots.slice(1)) {
    commonIds = new Set([...commonIds].filter((id) => roots.has(id)))
  }
  const firstId = commonIds.values().next().value as string | undefined
  if (!firstId) return null
  return { name: perProductRoots[0].get(firstId)! }
}

export default async function ShopCollection({
  region,
}: {
  region: HttpTypes.StoreRegion
}) {
  const t = await getTranslations("home")
  const { collections } = await listCollections({ limit: "100" })

  // Same metadata.featured flag the nav menu uses (see nav/index.tsx) to
  // pick its standalone top-level entry — set on exactly one collection in
  // the admin's Metadata editor.
  const featuredCollection = collections.find((c) =>
    isMetadataFlagSet(c.metadata, "featured")
  )

  if (featuredCollection) {
    const {
      response: { products },
    } = await listProducts({
      regionId: region.id,
      queryParams: {
        collection_id: featuredCollection.id,
        limit: 4,
        fields: PRODUCT_FIELDS,
      },
    })
    if (!products.length) return null

    return (
      <ShopSection
        title={featuredCollection.title}
        subtitle={
          typeof featuredCollection.metadata?.description === "string"
            ? featuredCollection.metadata.description
            : undefined
        }
        ctaHref={`/collections/${featuredCollection.handle}`}
        products={products}
        region={region}
        t={t}
      />
    )
  }

  // No featured collection — fall back to individually flagged products
  // (metadata.featured on the product itself), titled after whatever
  // parent category they share, so this still reads as a coherent grouping
  // rather than a random assortment.
  const {
    response: { products: candidateProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: { limit: 100, order: "-created_at", fields: PRODUCT_FIELDS },
  })
  const featuredProducts = candidateProducts
    .filter((p) => isMetadataFlagSet(p.metadata, "featured"))
    .slice(0, 4)

  if (!featuredProducts.length) return null

  const commonCategory = findCommonParentCategory(featuredProducts)

  return (
    <ShopSection
      title={commonCategory?.name ?? t("Recomandate")}
      ctaHref="/ready-to-wear"
      products={featuredProducts}
      region={region}
      t={t}
    />
  )
}

function ShopSection({
  title,
  subtitle,
  ctaHref,
  products,
  region,
  t,
}: {
  title: string
  subtitle?: string
  ctaHref: string
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  t: Awaited<ReturnType<typeof getTranslations>>
}) {
  return (
    <section className="section shop-sec" id="shop">
      <div className="section-inner">
        <div className="shop-header">
          <div className="kicker rv">{title}</div>
          <h2 className="shop-hl rv">
            {t("Colecție")} <br />
            <em>{t("nouă")}</em>
          </h2>
          {subtitle && <p className="shop-sub rv">{subtitle}</p>}
        </div>

        <div className="shop-grid rv" data-rv-delay="0.15">
          {products.slice(0, 4).map((product) => (
            <ProductPreview key={product.id} product={product} region={region} forceDark />
          ))}
        </div>

        <div className="rv hero-cta-wrap" data-rv-delay="0.2" style={{ marginTop: "2.5rem" }}>
          <LocalizedClientLink href={ctaHref} className="hero-cta hero-cta--wide">
            <span className="hero-cta-text">{t("Vezi colecția")}</span>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}
