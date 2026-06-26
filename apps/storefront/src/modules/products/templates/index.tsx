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
import AnimatedColumn from "@modules/products/components/animated-column"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
  previewFallback?: boolean
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
  previewFallback = false,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <div className="bg-[var(--theme-bg)] min-h-screen">
      {/* Back to shop */}
      <AnimatedColumn
        direction="up"
        delay={0}
        className="page-container pt-3 small:pt-6 pb-0"
      >
        <LocalizedClientLink
          href="/store"
          className="inline-flex items-center gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-gold)] transition-colors font-sans text-[11px] uppercase tracking-[3px]"
        >
          <span>←</span>
          <span>Înapoi la shop</span>
        </LocalizedClientLink>
      </AnimatedColumn>

      {/* Main product section */}
      <div
        className="page-container grid grid-cols-1 small:grid-cols-[1fr_400px] gap-x-16 py-8 small:pb-12 pt-2 small:pt-8 small:max-w-5xl"
        data-testid="product-container"
      >
        {/* Images — left, scrolls with page */}
        <AnimatedColumn direction="left" delay={0.1}>
          <Suspense fallback={<ImageGallery images={images} />}>
            <VariantAwareGallery
              defaultImages={images}
              variants={product.variants}
              options={product.options}
              allImages={product.images ?? []}
            />
          </Suspense>
        </AnimatedColumn>

        {/* Info + actions — right, sticky */}
        <AnimatedColumn
          direction="right"
          delay={0.2}
          className="flex flex-col gap-y-6 small:sticky small:top-24 small:self-start py-4 small:py-0"
        >
          <ProductOnboardingCta />
          <ProductInfo
            product={product}
            action={
              <ProductFavoriteButton
                productId={product.id}
                productHandle={product.handle ?? ""}
                productTitle={product.title ?? ""}
                productThumbnail={product.thumbnail ?? null}
              />
            }
          />
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper
              id={product.id}
              region={region}
              fallbackProduct={previewFallback ? product : undefined}
            />
          </Suspense>
          <ProductTabs product={product} />
        </AnimatedColumn>
      </div>

      {/* Related / fits-with products */}
      <Suspense fallback={<SkeletonRelatedProducts />}>
        <RelatedProducts product={product} countryCode={countryCode} />
      </Suspense>
    </div>
  )
}

export default ProductTemplate
