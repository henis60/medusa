"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

export type FavoriteItem = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
}

type FavoritesContextType = {
  favorites: FavoriteItem[]
  isFavorite: (id: string) => boolean
  toggle: (item: FavoriteItem) => void
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  toggle: () => {},
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

  const isFavorite = (id: string) => favorites.some((f) => f.id === id)

  const toggle = (item: FavoriteItem) => {
    setFavorites((prev) =>
      prev.some((f) => f.id === item.id)
        ? prev.filter((f) => f.id !== item.id)
        : [...prev, item]
    )
  }

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggle }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => useContext(FavoritesContext)
