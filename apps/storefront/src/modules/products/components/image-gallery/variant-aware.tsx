"use client"

import { HttpTypes } from "@medusajs/types"
import { useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { resolveImageUrl } from "@lib/util/image-url"

type Props = {
  defaultImages: HttpTypes.StoreProductImage[]
  allImages: HttpTypes.StoreProductImage[]
  variants?: HttpTypes.StoreProductVariant[] | null
  options?: HttpTypes.StoreProductOption[] | null
}

function getVariantFirstImageIndex(
  variantId: string | null,
  variants: HttpTypes.StoreProductVariant[] | null | undefined,
  allImages: HttpTypes.StoreProductImage[]
): number {
  if (!variantId || !variants || !allImages.length) return 0

  const variant = variants.find((v) => v.id === variantId)
  if (!variant?.images?.length) return 0

  // Jump to the variant's first image; if not found, stay on image 0.
  const firstUrl = (variant.images[0] as HttpTypes.StoreProductImage).url
  const idx = allImages.findIndex((img) => img.url === firstUrl)
  return idx >= 0 ? idx : 0
}

export default function VariantAwareGallery({
  defaultImages,
  allImages,
  variants,
}: Props) {
  const searchParams = useSearchParams()
  const variantId = searchParams.get("v_id")

  // Always show all images; variant selection only changes which is active
  const images = allImages.length ? allImages : defaultImages

  const [selectedIndex, setSelectedIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  // Jump to variant's first image when variant changes
  useEffect(() => {
    const idx = getVariantFirstImageIndex(variantId, variants, images)
    setSelectedIndex(idx)
  }, [variantId, variants, images])

  const selected = images[selectedIndex] ?? images[0]
  const count = images.length

  const prev = () => setSelectedIndex((i) => (i - 1 + count) % count)
  const next = () => setSelectedIndex((i) => (i + 1) % count)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
    touchStartX.current = null
  }
  // Mouse drag for desktop
  const mouseStartX = useRef<number | null>(null)
  const onMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX
  }
  const onMouseUp = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return
    const dx = e.clientX - mouseStartX.current
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
    mouseStartX.current = null
  }

  return (
    <div className="flex gap-3">
      {/* Thumbnail strip — left, vertical */}
      {count > 1 && (
        <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar w-16 shrink-0">
          {images.map((img, i) => (
            <button
              key={img.id ?? i}
              onClick={() => setSelectedIndex(i)}
              className={[
                "relative shrink-0 w-16 aspect-[3/4] overflow-hidden bg-[#F5F4F2] dark:bg-[#1e2a22] transition-all duration-200",
                i === selectedIndex
                  ? "ring-2 ring-hunter-gold opacity-100"
                  : "opacity-40 hover:opacity-70",
              ].join(" ")}
            >
              {img.url && (
                <Image
                  src={resolveImageUrl(img.url)!}
                  alt={`Product image ${i + 1}`}
                  fill
                  className="object-contain object-center"
                  sizes="64px"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main image + dots */}
      <div className="flex flex-col flex-1 gap-3">
        <div
          className="relative aspect-[3/4] overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        >
          <AnimatePresence mode="sync">
            {selected?.url && (
              <motion.div
                key={selected.url}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={resolveImageUrl(selected.url)!}
                  alt="Product image"
                  fill
                  priority
                  draggable={false}
                  className="object-contain object-center pointer-events-none"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dots */}
        {count > 1 && (
          <div className="flex items-center justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                aria-label={`Image ${i + 1}`}
                className={[
                  "transition-all duration-200",
                  i === selectedIndex
                    ? "w-4 h-[3px] bg-hunter-gold"
                    : "w-[3px] h-[3px] rounded-full bg-[var(--theme-text-muted)] opacity-50 hover:opacity-80",
                ].join(" ")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
