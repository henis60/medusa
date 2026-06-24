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
        <div key={item.id} className="group relative aspect-[3/4] overflow-hidden">
          <LocalizedClientLink href={`/products/${item.handle}`} className="block w-full h-full">
            {item.thumbnail ? (
              <Image
                src={resolveImageUrl(item.thumbnail) ?? item.thumbnail}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-contain object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)]">
                  {item.title}
                </span>
              </div>
            )}
          </LocalizedClientLink>
          <button
            onClick={() => toggle(item)}
            aria-label="Elimină din salvate"
            className="absolute top-2 right-2 z-10 p-1 transition-opacity duration-150 opacity-80 hover:opacity-100"
          >
            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} fill="#c9a84c" stroke="#c9a84c" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
