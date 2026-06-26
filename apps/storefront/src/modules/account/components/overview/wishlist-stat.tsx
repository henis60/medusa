"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useFavorites } from "@lib/context/favorites-context"

export default function WishlistStat() {
  const { favorites } = useFavorites()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <LocalizedClientLink
      href="/account/favorites"
      className="group flex flex-col gap-1.5 flex-1 text-center"
    >
      <span className="font-display text-[52px] leading-none text-[var(--theme-text)] group-hover:text-hunter-gold transition-colors">
        {mounted ? favorites.length : 0}
      </span>
      <span className="font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)]">
        Salvate
      </span>
    </LocalizedClientLink>
  )
}
