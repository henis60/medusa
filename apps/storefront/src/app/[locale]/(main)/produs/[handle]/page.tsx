import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductByHandle, listProductHandles } from "@lib/data/products"
import { getRegionStatic } from "@lib/data/regions"
import { setRequestLocaleValue } from "@lib/util/request-locale"
import { getBaseURL } from "@lib/util/env"
import { getProductPrice } from "@lib/util/get-product-price"
import { serializeJsonLd } from "@lib/util/json-ld"
import ProductTemplate from "@modules/products/templates"

const SITE_NAME = "The Hunter House"

const COUNTRY = "ro"

// Static + ISR: cookie-free data fetches (see getProductByHandle), so pages
// prerender at build and regenerate in the background every hour.
export const revalidate = 3600

type Props = {
  params: Promise<{ handle: string; locale: string }>
}

export async function generateStaticParams() {
  const region = await getRegionStatic(COUNTRY)
  if (!region) return []
  const handles = await listProductHandles(region.id)
  return handles.map((handle) => ({ handle }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { handle, locale } = await props.params
  // generateMetadata is a separate invocation from the page component, so
  // it needs its own locale seed before fetching — see (main)/layout.tsx.
  setRequestLocaleValue(locale)
  const region = await getRegionStatic(COUNTRY)

  if (!region) {
    notFound()
  }

  const product = await getProductByHandle(handle, region.id)

  if (!product) {
    notFound()
  }

  const description = product.description
    ? product.description.slice(0, 300)
    : `${product.title} — ${SITE_NAME}`
  const title = `${product.title} | ${SITE_NAME}`

  return {
    // .absolute bypasses the root layout's title template ("%s | The Hunter
    // House") — `title` here already has the brand suffix baked in, so
    // without it the page would render "Product | The Hunter House | The
    // Hunter House".
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/produs/${handle}`,
    },
    openGraph: {
      title,
      description,
      images: product.thumbnail ? [{ url: product.thumbnail }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const { handle, locale } = await props.params
  // Next may render this page concurrently with its ancestor layouts, so
  // re-seed from this segment's own params before fetching — see
  // (main)/layout.tsx.
  setRequestLocaleValue(locale)
  const region = await getRegionStatic(COUNTRY)

  if (!region) {
    notFound()
  }

  const pricedProduct = await getProductByHandle(handle, region.id)

  if (!pricedProduct) {
    notFound()
  }

  const { cheapestPrice } = getProductPrice({ product: pricedProduct })
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pricedProduct.title,
    description: pricedProduct.description ?? pricedProduct.title,
    image: pricedProduct.images?.length
      ? pricedProduct.images.map((img) => img.url)
      : pricedProduct.thumbnail
      ? [pricedProduct.thumbnail]
      : [],
    brand: { "@type": "Brand", name: "The Hunter House" },
    ...(cheapestPrice
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: cheapestPrice.currency_code.toUpperCase(),
            price: cheapestPrice.calculated_price_number.toFixed(2),
            availability: "https://schema.org/InStock",
            url: `${getBaseURL()}/produs/${handle}`,
          },
        }
      : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={COUNTRY}
        images={pricedProduct.images ?? []}
      />
    </>
  )
}
