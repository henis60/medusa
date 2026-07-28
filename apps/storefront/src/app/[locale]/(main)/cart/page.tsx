import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { setRequestLocaleValue } from "@lib/util/request-locale"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })
  return {
    title: t("Cart"),
    description: t("View your cart"),
  }
}

// Per-user page — always rendered on request, never prerendered.
export const dynamic = "force-dynamic"

export default async function Cart({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  // Next may render this page concurrently with its ancestor layouts, so
  // re-seed from this segment's own params before fetching — see
  // (main)/layout.tsx.
  const { locale } = await params
  setRequestLocaleValue(locale)

  const [cart, customer] = await Promise.all([
    retrieveCart().catch((error) => {
      console.error(error)
      return notFound()
    }),
    retrieveCustomer(),
  ])

  return <CartTemplate cart={cart} customer={customer} />
}
