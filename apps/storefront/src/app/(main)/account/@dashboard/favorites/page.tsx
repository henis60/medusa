import { Metadata } from "next"
import FavoritesList from "@modules/account/components/favorites-list"

export const metadata: Metadata = {
  title: "Favorite",
  description: "Produsele tale salvate.",
}

export default function FavoritesPage() {
  return (
    <div className="w-full" data-testid="favorites-page-wrapper">
      <div className="hidden small:block small:px-8 pt-8 pb-6 hidden small:block">
        <h1 className="font-display text-[32px] leading-[1] text-[var(--theme-text)]">
          Favorite
        </h1>
      </div>
      <FavoritesList />
    </div>
  )
}
