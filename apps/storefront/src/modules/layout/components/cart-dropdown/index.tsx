"use client"

import { AnimatePresence, motion } from "framer-motion"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { XMark } from "@medusajs/icons"
import { Button } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { BagIcon } from "@modules/layout/components/nav-icons"
import CountBadge from "@modules/common/components/count-badge"
import { resolveImageUrl } from "@lib/util/image-url"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { COLOR_OPTION_NAMES } from "@lib/util/product"

function getVariantImageUrl(item: HttpTypes.StoreCartLineItem): string | null {
  const variant = item.variant as any
  const product = variant?.product
  if (!variant || !product) return null

  // 1. Variant-specific thumbnail
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

  // Use options.values (creation order = image upload order)
  const colorValues: string[] = (colorOption.values ?? [])
    .map((v: { value?: string }) => v.value)
    .filter((v): v is string => !!v)

  // Fallback: derive from product variants if options.values empty
  if (!colorValues.length) {
    const allVariants: any[] = product.variants ?? []
    const fromVariants = [
      ...new Set(
        allVariants
          .map(
            (v: any) =>
              v.options?.find((o: any) => o.option_id === colorOption.id)?.value
          )
          .filter(Boolean) as string[]
      ),
    ]
    colorValues.push(...fromVariants)
  }

  const variantColor = variant.options?.find(
    (o: { option_id?: string }) => o.option_id === colorOption.id
  )?.value
  const idx = variantColor ? colorValues.indexOf(variantColor) : -1
  return idx >= 0 && idx < allImages.length ? allImages[idx].url ?? null : null
}

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const open = () => setCartDrawerOpen(true)
  const close = () => setCartDrawerOpen(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  const pathname = usePathname()

  useEffect(() => {
    if (!cartDrawerOpen) {
      return
    }

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth
    document.documentElement.style.overflow = "hidden"
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`

    const allowSelector = '[data-scroll-lock-allow="true"]'
    const isAllowedTarget = (target: EventTarget | null) => {
      return target instanceof HTMLElement && !!target.closest(allowSelector)
    }

    const onWheel = (event: WheelEvent) => {
      if (isAllowedTarget(event.target)) {
        return
      }
      event.preventDefault()
    }

    const onTouchMove = (event: TouchEvent) => {
      if (isAllowedTarget(event.target)) {
        return
      }
      event.preventDefault()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const scrollKeys = [
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ]

      if (!scrollKeys.includes(event.key)) {
        return
      }

      if (isAllowedTarget(document.activeElement)) {
        return
      }

      event.preventDefault()
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.documentElement.style.overflow = ""
      document.documentElement.style.paddingRight = ""
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [cartDrawerOpen])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close()
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // Open drawer when cart items change, except when already on cart page.
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      open()
    }

    itemRef.current = totalItems
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, pathname])

  return (
    <div className="h-full z-50">
      <button type="button" onClick={open} className="h-full flex items-center">
        <span
          className="relative flex items-center hover:opacity-60 transition-opacity"
          data-testid="nav-cart-link"
          aria-label={`Cart (${totalItems})`}
        >
          <BagIcon size={22} />
          <CountBadge count={totalItems} />
        </span>
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {cartDrawerOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="fixed inset-0 z-[9010] bg-[rgba(6,10,8,0.55)] backdrop-blur-[2px] pointer-events-auto"
                  onClick={close}
                  data-testid="side-cart-backdrop"
                />

                {/* Drawer panel */}
                <motion.div
                  key="panel"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed inset-y-0 right-0 left-0 z-[9011] h-dvh sm:left-auto sm:w-[420px] will-change-transform"
                  data-testid="nav-cart-dropdown"
                >
                  <div className="flex flex-col h-full overflow-hidden bg-[var(--theme-bg)] shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-7 h-16 border-b border-[var(--theme-border)] shrink-0">
                      <div className="flex items-baseline gap-3">
                        <h2 className="font-sans text-[10px] uppercase tracking-[0.2em] text-[var(--theme-text)]">
                          Coș
                        </h2>
                        {totalItems > 0 && (
                          <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                            ({totalItems})
                          </span>
                        )}
                      </div>
                      <button
                        data-testid="close-cart-button"
                        onClick={close}
                        aria-label="Close cart drawer"
                        className="inline-flex h-12 w-12 items-center justify-end text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
                      >
                        <XMark />
                      </button>
                    </div>

                    {cartState && cartState.items?.length ? (
                      <>
                        {/* Items */}
                        <div
                          data-scroll-lock-allow="true"
                          className="flex-1 overflow-y-auto overscroll-contain no-scrollbar px-7 py-6 flex flex-col gap-6"
                        >
                          {cartState.items
                            .sort((a, b) =>
                              (a.created_at ?? "") > (b.created_at ?? "")
                                ? -1
                                : 1
                            )
                            .map((item) => {
                              const imgSrc = resolveImageUrl(
                                getVariantImageUrl(item) ||
                                  item.thumbnail ||
                                  item.variant?.product?.images?.[0]?.url
                              )
                              const hasDiscount =
                                (item.total ?? 0) < (item.original_total ?? 0)
                              return (
                                <div
                                  key={item.id}
                                  className="flex gap-4"
                                  data-testid="cart-item"
                                >
                                  {/* Thumbnail */}
                                  <LocalizedClientLink
                                    href={`/products/${item.product_handle}`}
                                    className="shrink-0"
                                    onClick={close}
                                  >
                                    <div className="relative w-[72px] aspect-[3/4] overflow-hidden bg-white">
                                      {imgSrc && (
                                        <Image
                                          src={imgSrc}
                                          alt={item.product_title ?? ""}
                                          fill
                                          className="object-contain object-center"
                                          sizes="72px"
                                        />
                                      )}
                                    </div>
                                  </LocalizedClientLink>

                                  {/* Info */}
                                  <div className="flex flex-col flex-1 min-w-0 py-2 justify-between">
                                    {/* Title + delete */}
                                    <div className="flex items-start justify-between gap-2">
                                      <LocalizedClientLink
                                        href={`/products/${item.product_handle}`}
                                        data-testid="product-link"
                                        onClick={close}
                                        className="flex-1 min-w-0"
                                      >
                                        <span className="font-sans text-[10px] uppercase tracking-[2px] leading-[1.4] text-[var(--theme-text)] hover:text-hunter-gold transition-colors line-clamp-2 block">
                                          {item.product_title}
                                        </span>
                                      </LocalizedClientLink>
                                      <button
                                        onClick={() => deleteLineItem(item.id)}
                                        aria-label="Șterge"
                                        data-testid="cart-item-remove-button"
                                        className="shrink-0 mt-[1px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
                                      >
                                        <svg
                                          width="11"
                                          height="11"
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

                                    {/* Variant */}
                                    {(() => {
                                      const opts = (item.variant as any)
                                        ?.options as
                                        | { value?: string }[]
                                        | undefined
                                      const label =
                                        opts
                                          ?.map((o) => o.value)
                                          .filter(Boolean)
                                          .join(" · ") || item.variant?.title
                                      return label ? (
                                        <span
                                          className="font-serif italic text-[11px] text-[var(--theme-text-muted)] mt-0.5 block"
                                          data-testid="cart-item-variant"
                                        >
                                          {label}
                                        </span>
                                      ) : null
                                    })()}

                                    {/* Bottom row: qty stepper left, price stack right */}
                                    <div className="flex items-end justify-between mt-3">
                                      <div className="flex items-center gap-2 border border-[var(--theme-border)]">
                                        <button
                                          onClick={() => {
                                            if (item.quantity > 1)
                                              updateLineItem({
                                                lineId: item.id,
                                                quantity: item.quantity - 1,
                                              })
                                          }}
                                          disabled={item.quantity <= 1}
                                          aria-label="Scade cantitate"
                                          className="w-7 h-7 flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] disabled:opacity-30 transition-colors"
                                        >
                                          <svg
                                            width="9"
                                            height="9"
                                            viewBox="0 0 8 2"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                          >
                                            <line x1="1" y1="1" x2="7" y2="1" />
                                          </svg>
                                        </button>
                                        <span
                                          className="font-sans text-[10px] w-4 text-center text-[var(--theme-text)]"
                                          data-testid="cart-item-quantity"
                                          data-value={item.quantity}
                                        >
                                          {item.quantity}
                                        </span>
                                        <button
                                          onClick={() =>
                                            updateLineItem({
                                              lineId: item.id,
                                              quantity: item.quantity + 1,
                                            })
                                          }
                                          aria-label="Crește cantitate"
                                          className="w-7 h-7 flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
                                        >
                                          <svg
                                            width="9"
                                            height="9"
                                            viewBox="0 0 8 8"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                          >
                                            <line x1="4" y1="1" x2="4" y2="7" />
                                            <line x1="1" y1="4" x2="7" y2="4" />
                                          </svg>
                                        </button>
                                      </div>

                                      <div className="flex flex-col items-end gap-0.5">
                                        <span className="font-sans text-[8px] uppercase tracking-[1.5px] text-[var(--theme-text-muted)]">
                                          {convertToLocale({
                                            amount: item.unit_price ?? 0,
                                            currency_code:
                                              cartState.currency_code,
                                          })}{" "}
                                          / buc
                                        </span>
                                        {hasDiscount && (
                                          <span className="font-serif italic text-[11px] text-[var(--theme-text-muted)] line-through">
                                            {convertToLocale({
                                              amount: item.original_total ?? 0,
                                              currency_code:
                                                cartState.currency_code,
                                            })}
                                          </span>
                                        )}
                                        <span
                                          className="font-display text-[13px] text-[var(--theme-text)]"
                                          data-testid="product-price"
                                        >
                                          {convertToLocale({
                                            amount: item.total ?? 0,
                                            currency_code:
                                              cartState.currency_code,
                                          })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                        </div>

                        {/* Footer */}
                        <div className="shrink-0 px-7 pb-7 pt-5 border-t border-[var(--theme-border)] flex flex-col gap-4">
                          <div className="flex items-baseline justify-between">
                            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                              Subtotal
                            </span>
                            <span
                              className="font-display text-[22px] leading-none text-hunter-gold"
                              data-testid="cart-subtotal"
                              data-value={subtotal}
                            >
                              {convertToLocale({
                                amount: subtotal,
                                currency_code: cartState.currency_code,
                              })}
                            </span>
                          </div>
                          <LocalizedClientLink
                            href="/cart"
                            passHref
                            onClick={close}
                            className="w-full"
                          >
                            <Button
                              className="w-full h-12 rounded-none !bg-hunter-gold !text-hunter-dark !border-transparent hover:!bg-hunter-gold-b font-sans uppercase tracking-[3px] text-[11px]"
                              data-testid="go-to-cart-button"
                            >
                              Vezi coșul
                            </Button>
                          </LocalizedClientLink>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-7 pb-6 text-center">
                        <p className="font-sans text-[10px] uppercase tracking-[5px] text-[var(--theme-text-muted)]">
                          Coșul este gol
                        </p>
                        <p className="font-sans text-sm text-[var(--theme-text-muted)] max-w-xs">
                          Nu ai adăugat niciun produs în coș.
                        </p>
                        <LocalizedClientLink href="/store" onClick={close}>
                          <button className="mt-2 px-8 py-3 font-sans text-[10px] uppercase tracking-[4px] border border-hunter-gold text-hunter-gold hover:bg-hunter-gold hover:text-hunter-dark transition-colors">
                            Descoperă colecția
                          </button>
                        </LocalizedClientLink>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}

export default CartDropdown
