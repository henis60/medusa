"use client"

import { useFavorites } from "@lib/context/favorites-context"
import { resolveImageUrl } from "@lib/util/image-url"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

export default function FavoritesList() {
  const { favorites, toggle } = useFavorites()

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <p className="font-sans text-[10px] uppercase tracking-[5px] text-[var(--theme-text-muted)]">
          Niciun produs salvat
        </p>
        <p className="font-sans text-sm text-[var(--theme-text-muted)] max-w-xs">
          Salvează produse pentru a le găsi mai ușor mai târziu.
        </p>
        <LocalizedClientLink
          href="/store"
          className="mt-2 small:px-8 py-3 font-sans text-[10px] uppercase tracking-[4px] border border-hunter-gold text-hunter-gold hover:bg-hunter-gold hover:text-hunter-dark transition-colors"
        >
          Descoperă colecția
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-[var(--theme-border)] small:px-8 py-4">
      {favorites.map((item) => (
        <div
          key={item.id}
          className="group flex items-center gap-4 py-4 px-3 -mx-3 hover:bg-[var(--theme-surface)] transition-colors"
        >
          <LocalizedClientLink
            href={`/products/${item.handle}`}
            className="relative w-16 h-20 shrink-0 overflow-hidden bg-[var(--theme-surface)]"
          >
            {item.thumbnail ? (
              <Image
                src={resolveImageUrl(item.thumbnail) ?? item.thumbnail}
                alt={item.title}
                fill
                sizes="64px"
                className="object-contain object-center"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)]">
                  —
                </span>
              </div>
            )}
          </LocalizedClientLink>
          <LocalizedClientLink
            href={`/products/${item.handle}`}
            className="flex-1 min-w-0"
          >
            <p className="font-serif text-[16px] leading-[1.2] text-[var(--theme-text)] hover:text-hunter-gold transition-colors truncate">
              {item.title}
            </p>
          </LocalizedClientLink>
          <button
            onClick={() => toggle(item)}
            aria-label="Elimină din favorite"
            className="shrink-0 font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-rose-400 transition-colors"
          >
            Elimină
          </button>
        </div>
      ))}
    </div>
  )
}
