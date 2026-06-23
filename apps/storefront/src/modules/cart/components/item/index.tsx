"use client"

import { updateLineItem, deleteLineItem } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { resolveImageUrl } from "@lib/util/image-url"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { useState } from "react"
import { COLOR_OPTION_NAMES } from "@lib/util/product"

function getVariantImageUrl(item: HttpTypes.StoreCartLineItem): string | null {
  const variant = item.variant as any
  const product = variant?.product
  if (!variant || !product) return null

  // 1. Variant-specific thumbnail (set in Medusa admin per variant)
  if (variant.thumbnail) return variant.thumbnail

  // 2. Variant-specific images array
  if (variant.images?.length) return variant.images[0].url ?? null

  // 3. Map by color option index → product images
  const allImages: { url?: string }[] = product.images ?? []
  if (!allImages.length) return null

  const options: {
    id?: string
    title?: string
    values?: { value?: string }[]
  }[] = product.options ?? []
  const colorOption = options.find((o) =>
    COLOR_OPTION_NAMES.includes(o.title?.toLowerCase() ?? "")
  )
  if (!colorOption) return null

  // Use options.values array (creation order matches image upload order)
  const colorValues: string[] = (colorOption.values ?? [])
    .map((v) => v.value)
    .filter((v): v is string => !!v)

  // Fallback: derive from product variants if options.values is empty
  if (!colorValues.length) {
    const allVariants: any[] = product.variants ?? []
    const fromVariants = Array.from(
      new Set(
        allVariants
          .map(
            (v: any) =>
              v.options?.find((o: any) => o.option_id === colorOption.id)?.value
          )
          .filter(Boolean) as string[]
      )
    )
    colorValues.push(...fromVariants)
  }

  const variantColor = variant.options?.find(
    (o: { option_id?: string }) => o.option_id === colorOption.id
  )?.value
  const idx = variantColor ? colorValues.indexOf(variantColor) : -1
  return idx >= 0 && idx < allImages.length ? allImages[idx].url ?? null : null
}

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)

  const imgSrc = resolveImageUrl(
    getVariantImageUrl(item) ||
      item.thumbnail ||
      (item.variant?.product as any)?.images?.[0]?.url
  )

  const changeQuantity = async (qty: number) => {
    if (qty < 1 || updating) return
    setUpdating(true)
    await updateLineItem({ lineId: item.id, quantity: qty }).finally(() =>
      setUpdating(false)
    )
  }

  const hasDiscount = (item.total ?? 0) < (item.original_total ?? 0)

  if (type === "preview") {
    return (
      <div className="flex gap-3 py-3">
        <div className="relative w-12 aspect-[3/4] shrink-0 overflow-hidden bg-[#F5F4F2] dark:bg-[#1e2a22]">
          {imgSrc && (
            <Image
              src={imgSrc}
              alt={item.product_title ?? ""}
              fill
              className="object-cover object-center"
              sizes="48px"
            />
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0 justify-between py-2">
          <p className="font-sans text-[9px] uppercase tracking-[2px] text-[var(--theme-text)] truncate">
            {item.product_title}
          </p>
          {(() => {
            const opts = (item.variant as any)?.options as
              | { value: string }[]
              | undefined
            const label = opts?.length
              ? opts
                  .map((o) => o.value)
                  .filter(Boolean)
                  .join(" · ") || item.variant?.title
              : item.variant?.title
            return label ? (
              <p className="font-serif italic text-[11px] text-[var(--theme-text-muted)]">
                {label}
              </p>
            ) : null
          })()}
          <p className="font-sans text-[10px] text-[var(--theme-text)]">
            {convertToLocale({
              amount: item.total ?? 0,
              currency_code: currencyCode,
            })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-5 py-5 small:py-6" data-testid="product-row">
      {/* Image */}
      <LocalizedClientLink
        href={`/products/${item.product_handle}`}
        className="shrink-0"
      >
        <div className="relative w-[90px] small:w-[110px] aspect-[3/4] overflow-hidden bg-[#F5F4F2] dark:bg-[#1e2a22]">
          {imgSrc && (
            <Image
              src={imgSrc}
              alt={item.product_title ?? ""}
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 90px, 110px"
            />
          )}
        </div>
      </LocalizedClientLink>

      {/* Info */}
      <div className="flex flex-col flex-1 min-w-0 justify-between py-2">
        {/* Title + delete */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <LocalizedClientLink
              href={`/products/${item.product_handle}`}
              data-testid="product-link"
              className="flex-1 min-w-0"
            >
              <span className="font-sans text-[11px] small:text-[13px] uppercase tracking-[2.5px] leading-[1.6] text-[var(--theme-text)] hover:text-hunter-gold transition-colors">
                {item.product_title}
              </span>
            </LocalizedClientLink>
            <button
              onClick={() => deleteLineItem(item.id)}
              aria-label="Șterge"
              data-testid="product-delete-button"
              className="shrink-0 text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors mt-[2px]"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Variant */}
          {(() => {
            const opts = (item.variant as any)?.options as
              | { value?: string; option?: { title?: string } }[]
              | undefined
            const fromOpts = opts
              ?.map((o) => o.value)
              .filter(Boolean)
              .join(" · ")
            const label = fromOpts || item.variant?.title
            return label ? (
              <p className="font-serif italic text-[12px] small:text-[14px] text-[var(--theme-text-muted)] mt-1">
                {label}
              </p>
            ) : null
          })()}
        </div>

        {/* Bottom row: qty stepper left, price stack right */}
        <div className="flex items-end justify-between mt-5">
          {/* Qty stepper */}
          <div className="flex items-center gap-3 border border-[var(--theme-border)]">
            <button
              onClick={() => changeQuantity(item.quantity - 1)}
              disabled={updating || item.quantity <= 1}
              className="w-7 h-7 flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] disabled:opacity-30 transition-colors"
              aria-label="Scade cantitate"
            >
              <svg
                width="9"
                height="9"
                viewBox="0 0 10 2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <line x1="1" y1="1" x2="9" y2="1" />
              </svg>
            </button>
            <span
              className="font-sans text-[11px] w-4 text-center text-[var(--theme-text)]"
              data-testid="product-select-button"
              data-value={item.quantity}
            >
              {item.quantity}
            </span>
            <button
              onClick={() => changeQuantity(item.quantity + 1)}
              disabled={updating}
              className="w-7 h-7 flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] disabled:opacity-30 transition-colors"
              aria-label="Crește cantitate"
            >
              <svg
                width="9"
                height="9"
                viewBox="0 0 10 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <line x1="5" y1="1" x2="5" y2="9" />
                <line x1="1" y1="5" x2="9" y2="5" />
              </svg>
            </button>
          </div>

          {/* Price stack */}
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-sans text-[9px] small:text-[10px] uppercase tracking-[1.5px] text-[var(--theme-text-muted)]">
              {convertToLocale({
                amount: item.unit_price ?? 0,
                currency_code: currencyCode,
              })}{" "}
              / buc
            </span>
            <div className="relative flex flex-col items-end">
              {hasDiscount && (
                <span className="font-serif italic text-[11px] text-[var(--theme-text-muted)] line-through">
                  {convertToLocale({
                    amount: item.original_total ?? 0,
                    currency_code: currencyCode,
                  })}
                </span>
              )}
              <span
                className="font-display text-[15px] small:text-[18px] text-[var(--theme-text)]"
                data-testid="product-price"
              >
                {convertToLocale({
                  amount: item.total ?? 0,
                  currency_code: currencyCode,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Item
