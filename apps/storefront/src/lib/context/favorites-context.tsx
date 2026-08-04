"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { trackAddToWishlist } from "@lib/util/analytics"

export type FavoriteItem = {
  id: string
  /** Specific variant favorited from the product page (e.g. a color), if any. */
  variantId?: string | null
  variantTitle?: string | null
  handle: string
  title: string
  thumbnail: string | null
}

type FavoritesContextType = {
  favorites: FavoriteItem[]
  isFavorite: (id: string, variantId?: string | null) => boolean
  toggle: (item: FavoriteItem) => void
  /** False until localStorage has been read on mount. */
  loaded: boolean
}

const sameEntry = (a: { id: string; variantId?: string | null }, id: string, variantId?: string | null) =>
  a.id === id && (a.variantId ?? null) === (variantId ?? null)

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  toggle: () => {},
  loaded: false,
})

const STORAGE_KEY = "hunter_favorites"

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setFavorites(JSON.parse(stored))
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch {}
  }, [favorites, loaded])

  const isFavorite = (id: string, variantId?: string | null) =>
    favorites.some((f) => sameEntry(f, id, variantId))

  const toggle = (item: FavoriteItem) => {
    const wasFavorite = favorites.some((f) => sameEntry(f, item.id, item.variantId))
    // Fire GA4 only when adding (consent-gated inside the helper).
    if (!wasFavorite) {
      trackAddToWishlist({ id: item.id, name: item.title })
    }
    setFavorites((prev) =>
      prev.some((f) => sameEntry(f, item.id, item.variantId))
        ? prev.filter((f) => !sameEntry(f, item.id, item.variantId))
        : [...prev, item]
    )
  }

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggle, loaded }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => useContext(FavoritesContext)
