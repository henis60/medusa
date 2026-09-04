import React, { Suspense } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ImageGallery from "@modules/products/components/image-gallery"
import VariantAwareGallery from "@modules/products/components/image-gallery/variant-aware"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { getTranslations } from "next-intl/server"

import ProductActionsWrapper from "./product-actions-wrapper"
import ProductFavoriteButton from "@modules/products/components/product-favorite-button"
import AnimatedColumn from "@modules/products/components/animated-column"
import { SelectedVariantProvider } from "@modules/products/context/selected-variant-context"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
  previewFallback?: boolean
}

const ProductTemplate = async ({
  product,
  region,
  countryCode,
  images,
  previewFallback = false,
}: ProductTemplateProps) => {
  if (!product || !product.id) {
    return notFound()
  }

  const t = await getTranslations("products")

  return (
    <div className="bg-[var(--theme-bg)] min-h-screen">
      {/* Back to shop */}
      <AnimatedColumn
        direction="up"
        delay={0}
        className="page-container pt-3 small:pt-4 pb-0"
      >
        <LocalizedClientLink
          href="/ready-to-wear"
          className="inline-flex items-center gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-gold)] transition-colors font-sans text-[11px] uppercase tracking-[3px]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 6 9 12 15 18" />
          </svg>
          <span>{t("Înapoi")}</span>
        </LocalizedClientLink>
      </AnimatedColumn>

      {/* Main product section */}
      <SelectedVariantProvider initialVariantId={product.variants?.[0]?.id ?? null}>
        <div
          className="page-container grid grid-cols-1 small:grid-cols-[1fr_420px] gap-x-20 py-8 small:pb-16 pt-2 small:pt-4"
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
            <ProductInfo
              product={product}
              action={
                <ProductFavoriteButton
                  productId={product.id}
                  productHandle={product.handle ?? ""}
                  productTitle={product.title ?? ""}
                  productThumbnail={product.thumbnail ?? null}
                  variants={product.variants}
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
      </SelectedVariantProvider>

      {/* Related / fits-with products */}
      <Suspense fallback={<SkeletonRelatedProducts />}>
        <RelatedProducts product={product} countryCode={countryCode} />
      </Suspense>
    </div>
  )
}

export default ProductTemplate
