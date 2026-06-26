"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import {
  isSimpleProduct,
  isInStoreOnly,
  COLOR_OPTION_NAMES as COLOR_TITLES,
} from "@lib/util/product"
import { Button } from "@modules/common/components/ui"
import OptionSelect from "./option-select"
import { useMemo, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  options: Record<string, string | undefined>
  updateOptions: (title: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
}) => {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const sheetRef = useRef<HTMLDivElement>(null)
  const dragY = useRef(0)
  const startY = useRef(0)
  const dragging = useRef(false)
  const [dragOffset, setDragOffset] = useState(0)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    setDragOffset(0)
  }, [open])

  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true
    startY.current = e.touches[0].clientY
    dragY.current = 0
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return
    const delta = e.touches[0].clientY - startY.current
    if (delta < 0) return
    dragY.current = delta
    setDragOffset(delta)
  }
  const onTouchEnd = () => {
    dragging.current = false
    if (dragY.current > 80) {
      setDragOffset(0)
      setOpen(false)
    } else setDragOffset(0)
  }

  const price = getProductPrice({ product, variantId: variant?.id })
  const selectedPrice = useMemo(() => {
    if (!price) return null
    return price.variantPrice || price.cheapestPrice || null
  }, [price])

  const isColorOpt = (optId: string) =>
    COLOR_TITLES.includes(
      product.options?.find((o) => o.id === optId)?.title?.toLowerCase() ?? ""
    )
  const vmap = (v: HttpTypes.StoreProductVariant) =>
    v.options?.reduce((acc, o) => {
      if (o.option_id) acc[o.option_id] = o.value
      return acc
    }, {} as Record<string, string>) ?? {}

  const getDisabledValues = (optionId: string): Set<string> => {
    const allValues =
      product.options
        ?.find((o) => o.id === optionId)
        ?.values?.map((v) => v.value ?? "") ?? []
    if (isColorOpt(optionId)) {
      const available = new Set(
        (product.variants ?? []).map((v) => vmap(v)[optionId]).filter(Boolean)
      )
      return new Set(allValues.filter((v) => !available.has(v)))
    }
    const others = Object.entries(options).filter(
      ([id, val]) => id !== optionId && !!val
    ) as [string, string][]
    if (others.length === 0) return new Set()
    const available = new Set<string>()
    product.variants?.forEach((v) => {
      const map = vmap(v)
      if (others.every(([id, val]) => map[id] === val) && map[optionId])
        available.add(map[optionId])
    })
    return new Set(allValues.filter((v) => !available.has(v)))
  }

  const isSimple = isSimpleProduct(product)
  const inStoreOnly = isInStoreOnly(product)

  return (
    <>
      {/* Sticky bar */}
      <div
        className={clx(
          "lg:hidden inset-x-0 bottom-0 fixed z-50 transition-transform duration-300",
          !show && "translate-y-full pointer-events-none"
        )}
      >
        <div className="bg-[var(--theme-bg)] border-t border-[var(--theme-border)] flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[10px] uppercase tracking-[2px] text-[var(--theme-text)] truncate">
              {product.title}
            </p>
            {selectedPrice && (
              <p className="font-sans text-[11px] text-hunter-gold mt-0.5">
                {selectedPrice.calculated_price}
              </p>
            )}
          </div>

          {inStoreOnly ? (
            <div className="font-sans text-[8px] uppercase tracking-[4px] text-[#cfd8d2] border border-[rgba(207,216,210,0.35)] px-4 py-2.5 text-center">
              Disponibil în magazin
            </div>
          ) : isSimple ? (
            <Button
              onClick={handleAddToCart}
              disabled={!inStock}
              isLoading={isAdding}
              className="!bg-hunter-gold !text-hunter-dark !border-transparent font-sans uppercase tracking-[3px] text-[11px] px-6 py-3 rounded-none"
            >
              {!inStock ? "Indisponibil" : "Adaugă în coș"}
            </Button>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="font-sans text-[10px] uppercase tracking-[3px] border border-hunter-gold text-hunter-gold px-5 py-2.5 hover:bg-hunter-gold/10 transition-colors"
            >
              Alege mărimea
            </button>
          )}
        </div>
      </div>

      {/* Bottom sheet portal */}
      {mounted &&
        createPortal(
          <>
            <AnimatePresence>
              {open && (
                <motion.div
                  key="ma-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 z-[9020] bg-black/50 lg:hidden"
                  onClick={() => setOpen(false)}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {open && (
                <motion.div
                  key="ma-sheet"
                  ref={sheetRef}
                  initial={{ y: "100%" }}
                  animate={{ y: dragOffset }}
                  exit={{ y: "100%" }}
                  transition={
                    dragging.current
                      ? { duration: 0 }
                      : {
                          duration: 0.38,
                          ease: [0.22, 1, 0.36, 1] as [
                            number,
                            number,
                            number,
                            number
                          ],
                        }
                  }
                  className="fixed inset-x-0 bottom-0 z-[9021] bg-[var(--theme-bg)] border-t border-[var(--theme-border)] lg:hidden"
                >
                  {/* Drag handle */}
                  <div
                    className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    <div className="w-10 h-1 rounded-full bg-[var(--theme-border)]" />
                  </div>

                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-6 py-3 border-b border-[var(--theme-border)] touch-none"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    <span className="font-sans text-[10px] uppercase tracking-[4px] text-[var(--theme-text-muted)]">
                      {product.title}
                    </span>
                    {selectedPrice && (
                      <span className="font-sans text-[11px] text-hunter-gold">
                        {selectedPrice.calculated_price}
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div
                    className="px-6 py-5 flex flex-col gap-6 overflow-y-auto max-h-[60dvh]"
                    data-scroll-lock-allow="true"
                  >
                    {(product.options || []).map((option) => (
                      <div key={option.id}>
                        <OptionSelect
                          option={option}
                          current={options[option.id]}
                          updateOption={updateOptions}
                          title={option.title ?? ""}
                          disabled={optionsDisabled}
                          disabledValues={getDisabledValues(option.id)}
                          variants={product.variants}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-[var(--theme-border)] flex gap-3">
                    <button
                      onClick={() => setOpen(false)}
                      className="flex-1 py-3 font-sans text-[10px] uppercase tracking-[3px] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-[var(--theme-text-muted)] transition-colors"
                    >
                      Înapoi
                    </button>
                    <button
                      onClick={() => {
                        handleAddToCart()
                        setOpen(false)
                      }}
                      disabled={!inStock || !variant || isAdding}
                      className="flex-[2] py-3 font-sans text-[10px] uppercase tracking-[3px] bg-hunter-gold text-hunter-dark transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isAdding
                        ? "Se adaugă…"
                        : !variant
                        ? "Selectează"
                        : !inStock
                        ? "Stoc epuizat"
                        : "Adaugă în coș"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>,
          document.body
        )}
    </>
  )
}

export default MobileActions
