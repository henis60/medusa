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
    <div className="grid grid-cols-2 small:grid-cols-4 gap-x-3 gap-y-6 small:px-8 py-8">
      {favorites.map((item) => (
        <div key={item.id} className="group flex flex-col gap-2">
          <LocalizedClientLink href={`/products/${item.handle}`} className="block relative aspect-[3/4] overflow-hidden">
            {item.thumbnail ? (
              <Image
                src={resolveImageUrl(item.thumbnail) ?? item.thumbnail}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)]">
                  {item.title}
                </span>
              </div>
            )}
          </LocalizedClientLink>
          <div className="flex items-center justify-between gap-2">
            <LocalizedClientLink href={`/products/${item.handle}`}>
              <p className="font-sans text-[9px] uppercase tracking-[2.5px] text-[var(--theme-text)] hover:text-hunter-gold transition-colors truncate">
                {item.title}
              </p>
            </LocalizedClientLink>
            <button
              onClick={() => toggle(item)}
              aria-label="Elimină din salvate"
              className="shrink-0 opacity-40 hover:opacity-100 transition-opacity"
            >
              <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
