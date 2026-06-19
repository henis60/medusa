import React, { Suspense } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ImageGallery from "@modules/products/components/image-gallery"
import VariantAwareGallery from "@modules/products/components/image-gallery/variant-aware"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"
import ProductFavoriteButton from "@modules/products/components/product-favorite-button"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <div className="bg-[var(--theme-bg)] min-h-screen">
      {/* Back to shop */}
      <div className="content-container pt-3 small:pt-6 pb-0">
        <LocalizedClientLink
          href="/store"
          className="inline-flex items-center gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-gold)] transition-colors font-sans text-[11px] uppercase tracking-[3px]"
        >
          <span>←</span>
          <span>Înapoi la shop</span>
        </LocalizedClientLink>
      </div>

      {/* Main product section */}
      <div
        className="content-container grid grid-cols-1 small:grid-cols-[1fr_400px] gap-x-16 py-8 small:pb-12 pt-2 small:pt-8 small:max-w-5xl"
        data-testid="product-container"
      >
        {/* Images — left, scrolls with page */}
        <div>
          <Suspense fallback={<ImageGallery images={images} />}>
            <VariantAwareGallery
              defaultImages={images}
              variants={product.variants}
              options={product.options}
              allImages={product.images ?? []}
            />
          </Suspense>
        </div>

        {/* Info + actions — right, sticky */}
        <div className="flex flex-col gap-y-6 small:sticky small:top-24 small:self-start py-4 small:py-0">
          <ProductOnboardingCta />
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <ProductInfo product={product} />
            </div>
            <ProductFavoriteButton
              productId={product.id}
              productHandle={product.handle ?? ""}
              productTitle={product.title ?? ""}
              productThumbnail={product.thumbnail ?? null}
            />
          </div>
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>
          <ProductTabs product={product} />
        </div>
      </div>

      {/* Related / fits-with products */}
      <Suspense fallback={<SkeletonRelatedProducts />}>
        <RelatedProducts product={product} countryCode={countryCode} />
      </Suspense>
    </div>
  )
}

export default ProductTemplate
