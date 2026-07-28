import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { setRequestLocaleValue } from "@lib/util/request-locale"
import { HttpTypes } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"

type Props = {
  params: Promise<{ category: string[]; locale: string }>
}

// Static + ISR: sort/continuous loading are handled client-side, so the page
// reads no searchParams and serves cached HTML without hitting the backend.
export const revalidate = 3600

export async function generateStaticParams() {
  const product_categories = await listCategories()

  if (!product_categories) {
    return []
  }

  return product_categories.map(
    (category: HttpTypes.StoreProductCategory) => ({
      category: [category.handle],
    })
  )
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  // generateMetadata is a separate invocation from the page component, so
  // it needs its own locale seed before fetching — see (main)/layout.tsx.
  setRequestLocaleValue(params.locale)
  try {
    const productCategory = await getCategoryByHandle(params.category)

    const title = productCategory.name + " | Medusa Store"

    const description = productCategory.description ?? `${title} category.`

    return {
      title: `${title} | Medusa Store`,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const params = await props.params
  // Next may render this page concurrently with its ancestor layouts, so
  // re-seed from this segment's own params before fetching — see
  // (main)/layout.tsx.
  setRequestLocaleValue(params.locale)

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  return <CategoryTemplate category={productCategory} countryCode={"ro"} />
}

