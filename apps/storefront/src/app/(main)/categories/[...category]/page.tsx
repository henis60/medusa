import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { HttpTypes } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"

type Props = {
  params: Promise<{ category: string[] }>
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

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  return <CategoryTemplate category={productCategory} countryCode={"ro"} />
}

