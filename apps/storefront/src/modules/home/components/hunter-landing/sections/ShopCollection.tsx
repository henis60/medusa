import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ShopCollection({
  region,
}: {
  region: HttpTypes.StoreRegion
}) {
  const { collections } = await listCollections({ limit: "10" })
  if (!collections.length) return null

  const collection = collections[0]

  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      limit: "4",
      fields: "*variants.calculated_price,+variants,+options,+images",
    },
  })

  if (!products.length) return null

  return (
    <section className="section shop-sec" id="shop">
      <div className="section-inner">
        <div className="shop-header">
          <div className="kicker rv">
            <span className="kicker-bar"></span>{collection.title}
          </div>
          <h2 className="shop-hl rv">
            Colecție <br />
            <em>nouă</em>
          </h2>
          <p className="shop-sub rv">
            Disponibilă acum în magazinul nostru online.
          </p>
        </div>

        <div className="shop-grid rv" style={{ transitionDelay: "0.15s" }}>
          {products.slice(0, 4).map((product) => (
            <ProductPreview key={product.id} product={product} region={region} forceDark />
          ))}
        </div>

        <div className="rv hero-cta-wrap" style={{ transitionDelay: "0.2s", marginTop: "2.5rem" }}>
          <LocalizedClientLink href={`/collections/${collection.handle}`} className="hero-cta hero-cta--wide">
            <span className="hero-cta-text">Vezi colecția</span>
            <span className="hero-cta-arrow">→</span>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}
