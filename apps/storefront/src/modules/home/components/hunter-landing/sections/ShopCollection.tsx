import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ShopCollection({
  region,
}: {
  region: HttpTypes.StoreRegion
}) {
  const t = await getTranslations("home")
  const { collections } = await listCollections({ limit: "10" })
  if (!collections.length) return null

  const collection = collections[0]

  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      limit: 4,
      fields: "*variants.calculated_price,+variants,+options,+images",
    },
  })

  if (!products.length) return null

  return (
    <section className="section shop-sec" id="shop">
      <div className="section-inner">
        <div className="shop-header">
          <div className="kicker rv">
            {collection.title}
          </div>
          <h2 className="shop-hl rv">
            {t("Colecție")} <br />
            <em>{t("nouă")}</em>
          </h2>
          {typeof collection.metadata?.description === "string" && collection.metadata.description && (
            <p className="shop-sub rv">{collection.metadata.description}</p>
          )}
        </div>

        <div className="shop-grid rv" data-rv-delay="0.15">
          {products.slice(0, 4).map((product) => (
            <ProductPreview key={product.id} product={product} region={region} forceDark />
          ))}
        </div>

        <div className="rv hero-cta-wrap" data-rv-delay="0.2" style={{ marginTop: "2.5rem" }}>
          <LocalizedClientLink href={`/collections/${collection.handle}`} className="hero-cta hero-cta--wide">
            <span className="hero-cta-text">{t("Vezi colecția")}</span>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}
