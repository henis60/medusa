import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductByHandle, listProductHandles } from "@lib/data/products"
import { getRegionStatic } from "@lib/data/regions"
import { setRequestLocaleValue } from "@lib/util/request-locale"
import ProductTemplate from "@modules/products/templates"

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

  return {
    title: `${product.title} | Medusa Store`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | Medusa Store`,
      description: `${product.title}`,
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

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={COUNTRY}
      images={pricedProduct.images ?? []}
    />
  )
}
