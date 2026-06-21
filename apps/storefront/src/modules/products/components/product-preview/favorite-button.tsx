"use client"

import { useEffect, useState } from "react"
import { useFavorites } from "@lib/context/favorites-context"

type Props = {
  productId?: string
  productHandle?: string
  productTitle?: string
  productThumbnail?: string | null
  size?: number
}

export default function FavoriteButton({ productId, productHandle, productTitle, productThumbnail, size = 16 }: Props) {
  const { isFavorite, toggle } = useFavorites()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Favorites live in localStorage (client-only), so keep the default state
  // until mounted to avoid a hydration mismatch.
  const on = mounted && !!productId && isFavorite(productId)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!productId || !productHandle) return
    toggle({ id: productId, handle: productHandle, title: productTitle ?? "", thumbnail: productThumbnail ?? null })
  }

  return (
    <button
      type="button"
      aria-label={on ? "Elimină din salvate" : "Salvează"}
      aria-pressed={on}
      onClick={handleClick}
      className="absolute top-2 right-2 z-20 p-1 transition-opacity duration-150 opacity-60 hover:opacity-100"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: size, height: size }} fill={on ? "#c9a84c" : "none"} stroke={on ? "#c9a84c" : "rgba(128,128,128,0.8)"} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  )
}
