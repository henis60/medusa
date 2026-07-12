import { Metadata } from "next"
import FavoritesList from "@modules/wishlist/components/favorites-list"

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Produsele tale salvate.",
}

export default function WishlistPage() {
  return (
    <div className="page-container py-10 small:py-16" data-testid="wishlist-page-wrapper">
      <h1 className="font-display text-[32px] leading-[1] text-[var(--theme-text)] mb-6">
        Wishlist
      </h1>
      <FavoritesList />
    </div>
  )
}
