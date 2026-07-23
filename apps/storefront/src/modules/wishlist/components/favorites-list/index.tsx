"use client"

import { useEffect, useMemo, useState } from "react"
import { useFavorites } from "@lib/context/favorites-context"
import { getProductsByIds } from "@lib/data/products"
import { addToCart } from "@lib/data/cart"
import { emitCartUpdated } from "@lib/util/cart-events"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PreviewPrice from "@modules/products/components/product-preview/price"
import Image from "next/image"

const countryCode = "ro"

function FavoriteRow({
  item,
  product,
  onRemove,
}: {
  item: { id: string; handle: string; title: string; thumbnail: string | null }
  product?: HttpTypes.StoreProduct
  onRemove: () => void
}) {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const { cheapestPrice } = product
    ? getProductPrice({ product })
    : { cheapestPrice: null }

  const cheapestVariant = useMemo(() => {
    if (!product?.variants?.length) return null
    return (product.variants as HttpTypes.StoreProductVariant[])
      .filter((v) => !!(v as any).calculated_price)
      .sort(
        (a, b) =>
          ((a as any).calculated_price?.calculated_amount ?? 0) -
          ((b as any).calculated_price?.calculated_amount ?? 0)
      )[0]
  }, [product])

  const singleVariant =
    product?.variants?.length === 1 ? product.variants[0] : null
  const defaultVariant = singleVariant ?? cheapestVariant

  const inStock = defaultVariant
    ? !defaultVariant.manage_inventory ||
      (defaultVariant.inventory_quantity ?? 0) > 0 ||
      defaultVariant.allow_backorder
    : false

  const canQuickAdd =
    !!defaultVariant && (product?.options?.length ?? 0) <= 1

  const variantLabel = useMemo(() => {
    const opts = (defaultVariant as any)?.options as
      | { value?: string }[]
      | undefined
    return (
      opts?.map((o) => o.value).filter(Boolean).join(" · ") ||
      defaultVariant?.title ||
      null
    )
  }, [defaultVariant])

  const handleAdd = async () => {
    if (!defaultVariant?.id || adding) return
    setAdding(true)
    const freshCart = await addToCart({
      variantId: defaultVariant.id,
      quantity: 1,
      countryCode,
    })
    emitCartUpdated(freshCart, { action: "add" })
    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="group flex gap-4 py-4 px-3 -mx-3 hover:bg-[var(--theme-surface)] transition-colors">
      <LocalizedClientLink
        href={`/products/${item.handle}`}
        className="relative w-16 h-20 shrink-0 overflow-hidden bg-white"
      >
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
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

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <LocalizedClientLink
            href={`/products/${item.handle}`}
            className="flex-1 min-w-0"
          >
            <p className="font-serif text-[16px] leading-[1.2] text-[var(--theme-text)] hover:text-hunter-gold transition-colors truncate">
              {item.title}
            </p>
            {variantLabel && (
              <p className="font-serif italic text-[12px] text-[var(--theme-text-muted)] mt-0.5">
                {variantLabel}
              </p>
            )}
          </LocalizedClientLink>
          <button
            onClick={onRemove}
            aria-label="Elimină din wishlist"
            className="shrink-0 mt-[1px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex items-end justify-between gap-4 mt-3">
          {cheapestPrice ? (
            <div className="[&_*]:!text-[12px]">
              <PreviewPrice price={cheapestPrice} />
            </div>
          ) : (
            <span />
          )}

          {product ? (
            canQuickAdd ? (
              <button
                onClick={handleAdd}
                disabled={adding || !inStock}
                className="shrink-0 h-9 w-[148px] flex items-center justify-center font-sans text-[9px] uppercase tracking-[2.5px] border transition-colors disabled:cursor-not-allowed"
                style={
                  !inStock
                    ? // Out of stock — secondary (outlined, muted), not a
                      // dimmed primary
                      {
                        background: "transparent",
                        color: "var(--theme-text-muted)",
                        borderColor: "var(--theme-border)",
                      }
                    : {
                        background: added ? "transparent" : "#c9a84c",
                        color: added ? "#c9a84c" : "#0d0d0d",
                        borderColor: added ? "#c9a84c" : "transparent",
                      }
                }
              >
                {adding
                  ? "Se adaugă…"
                  : added
                  ? "✓ Adăugat"
                  : !inStock
                  ? "Stoc epuizat"
                  : "Adaugă în coș"}
              </button>
            ) : (
              <LocalizedClientLink
                href={`/products/${item.handle}`}
                className="shrink-0 h-9 w-[148px] flex items-center justify-center font-sans text-[9px] uppercase tracking-[2.5px] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-hunter-gold hover:text-hunter-gold transition-colors"
              >
                Alege opțiuni
              </LocalizedClientLink>
            )
          ) : null}
        </div>
      </div>
    </div>
  )
}

function FavoritesListSkeleton() {
  return (
    <div className="flex flex-col divide-y divide-[var(--theme-border)] small:px-8 py-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-4 py-4 px-3 -mx-3 animate-pulse">
          <div className="w-16 h-20 shrink-0 bg-[var(--theme-surface)]" />
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div className="flex flex-col gap-2">
              <div className="h-3 w-3/5 bg-[var(--theme-surface)]" />
              <div className="h-2.5 w-2/5 bg-[var(--theme-surface)]" />
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="h-3 w-16 bg-[var(--theme-surface)]" />
              <div className="h-9 w-[148px] bg-[var(--theme-surface)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function FavoritesList() {
  const { favorites, toggle, loaded } = useFavorites()
  const [products, setProducts] = useState<Record<string, HttpTypes.StoreProduct>>({})

  useEffect(() => {
    if (!favorites.length) return
    let cancelled = false
    getProductsByIds({ ids: favorites.map((f) => f.id), countryCode }).then(
      (fetched) => {
        if (cancelled) return
        setProducts(Object.fromEntries(fetched.map((p) => [p.id, p])))
      }
    )
    return () => {
      cancelled = true
    }
  }, [favorites.map((f) => f.id).join(",")])

  if (!loaded) {
    return <FavoritesListSkeleton />
  }

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
          href="/ready-to-wear"
          className="mt-2 px-6 small:px-8 py-3 font-sans text-[10px] uppercase tracking-[4px] border border-hunter-gold text-hunter-gold hover:bg-hunter-gold hover:text-hunter-dark transition-colors"
        >
          Descoperă colecția
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-[var(--theme-border)] small:px-8 py-4">
      {favorites.map((item) => (
        <FavoriteRow
          key={item.id}
          item={item}
          product={products[item.id]}
          onRemove={() => toggle(item)}
        />
      ))}
    </div>
  )
}
