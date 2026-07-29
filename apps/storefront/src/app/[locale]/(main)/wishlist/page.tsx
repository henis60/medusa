import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import FavoritesList from "@modules/wishlist/components/favorites-list"
import AccountFaqStrip from "@modules/account/components/account-faq-strip"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })
  return {
    title: t("Wishlist"),
    description: t("Produsele tale salvate"),
  }
}

export default async function WishlistPage() {
  const t = await getTranslations("app")
  return (
    <div className="page-container py-10 small:py-16" data-testid="wishlist-page-wrapper">
      <h1 className="font-display text-[32px] leading-[1] text-[var(--theme-text)] mb-6">
        {t("Wishlist")}
      </h1>
      <FavoritesList />
      <AccountFaqStrip />
    </div>
  )
}
