"use client"

import { useEffect, useState } from "react"
import { useFavorites } from "@lib/context/favorites-context"

type Props = {
  productId: string
  productHandle: string
  productTitle: string
  productThumbnail: string | null
}

export default function ProductFavoriteButton({ productId, productHandle, productTitle, productThumbnail }: Props) {
  const { isFavorite, toggle } = useFavorites()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Avoid hydration mismatch: favorites come from localStorage, which isn't
  // available on the server. Render the default (unfavorited) state until mounted.
  const on = mounted && isFavorite(productId)

  return (
    <button
      type="button"
      aria-label={on ? "Elimină din salvate" : "Salvează"}
      aria-pressed={on}
      onClick={() => toggle({ id: productId, handle: productHandle, title: productTitle, thumbnail: productThumbnail })}
      className="shrink-0 transition-colors duration-150"
      style={{ color: on ? "#c9a84c" : "var(--theme-text-muted)" }}
    >
      <svg viewBox="0 0 24 24" width={20} height={20} fill={on ? "#c9a84c" : "none"} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  )
}
