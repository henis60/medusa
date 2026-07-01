import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductByHandle, listProductHandles } from "@lib/data/products"
import { getRegionStatic } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"

const COUNTRY = "ro"

type Props = {
  params: Promise<{ handle: string }>
}

export async function generateStaticParams() {
  const region = await getRegionStatic(COUNTRY)
  if (!region) return []
  const handles = await listProductHandles(region.id)
  return handles.map((handle) => ({ handle }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { handle } = await props.params
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
  const { handle } = await props.params
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
