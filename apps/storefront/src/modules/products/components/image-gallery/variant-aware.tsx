"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { useTranslations } from "next-intl"
import {
  ChevronLeftMini,
  ChevronRightMini,
  XMark,
} from "@medusajs/icons"
import { useSelectedVariant } from "@modules/products/context/selected-variant-context"

// Minimalist "expand to fullscreen" glyph — four open corner brackets,
// styled in the site's gold accent instead of a generic filled icon.
function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 3H4v5" />
      <path d="M15 3h5v5" />
      <path d="M20 15v5h-5" />
      <path d="M4 15v5h5" />
    </svg>
  )
}

function ImageLightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: HttpTypes.StoreProductImage[]
  index: number
  onIndexChange: (i: number) => void
  onClose: () => void
}) {
  const t = useTranslations("products")
  const count = images.length
  const prev = () => onIndexChange((index - 1 + count) % count)
  const next = () => onIndexChange((index + 1) % count)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, count])

  // Lock body scroll while open — restore whatever was there before in case
  // another overlay (e.g. a cart drawer) already set it.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  const touchStartX = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
    touchStartX.current = null
  }

  const selected = images[index]

  return createPortal(
    <div
      className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label={t("Închide")}
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
      >
        <XMark className="w-7 h-7" />
      </button>

      {count > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            aria-label={t("Imaginea precedentă")}
            className="hidden small:block absolute left-2 small:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2"
          >
            <ChevronLeftMini className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            aria-label={t("Imaginea următoare")}
            className="hidden small:block absolute right-2 small:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2"
          >
            <ChevronRightMini className="w-8 h-8" />
          </button>
        </>
      )}

      {/* A plain <img> sized to its own content (not `fill` in a fixed box) —
          otherwise the letterboxed empty space around a portrait/landscape
          image would still count as "inside" the clickable area, and
          clicking beside the image wouldn't close the lightbox. */}
      {selected?.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={selected.url}
          alt={t("Imagine produs")}
          draggable={false}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="max-w-[92vw] max-h-[92vh] w-auto h-auto object-contain select-none"
        />
      )}

      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-sans">
          {index + 1} / {count}
        </div>
      )}
    </div>,
    document.body
  )
}

type Props = {
  defaultImages: HttpTypes.StoreProductImage[]
  allImages: HttpTypes.StoreProductImage[]
  variants?: HttpTypes.StoreProductVariant[] | null
  options?: HttpTypes.StoreProductOption[] | null
}

export default function VariantAwareGallery({
  defaultImages,
  allImages,
  variants,
}: Props) {
  const t = useTranslations("products")
  // Shared with ProductActions via context (not the URL) — the provider
  // initializes to variants[0].id, matching ProductActions' own default, so
  // the gallery starts on the right image set immediately instead of
  // showing all images for one frame and then narrowing down.
  const variantId = useSelectedVariant() ?? variants?.[0]?.id ?? null

  const selectedVariant = variantId
    ? variants?.find((v) => v.id === variantId)
    : null
  // Show only the selected variant's own images when it has any;
  // otherwise fall back to the full product gallery.
  const images = selectedVariant?.images?.length
    ? (selectedVariant.images as HttpTypes.StoreProductImage[])
    : allImages.length
    ? allImages
    : defaultImages

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [mainImageHeight, setMainImageHeight] = useState<number | null>(null)
  const touchStartX = useRef<number | null>(null)
  const thumbsRef = useRef<HTMLDivElement>(null)
  const mainImageRef = useRef<HTMLDivElement>(null)
  const thumbDragStart = useRef<{ y: number; scrollTop: number } | null>(null)
  // The very first image is server-rendered and already visible in the
  // initial HTML — fading it in from opacity:0 on hydration only delays
  // its paint until framer-motion runs. Skip the enter animation for that
  // one render; every later switch (variant change, arrow/dot/drag) still
  // gets the fade, since it's genuinely replacing on-screen content.
  const isFirstRender = useRef(true)
  useEffect(() => {
    isFirstRender.current = false
  }, [])

  useEffect(() => {
    if (!mainImageRef.current) return
    const observer = new ResizeObserver((entries) => {
      setMainImageHeight(entries[0].contentRect.height)
    })
    observer.observe(mainImageRef.current)
    return () => observer.disconnect()
  }, [])

  // Reset to the first image whenever the active image set changes
  // (e.g. switching to a variant with its own images).
  useEffect(() => {
    setSelectedIndex(0)
  }, [images])

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
  // Mouse drag for desktop (main image)
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

  // Drag-to-scroll for thumbnail strip
  const onThumbMouseDown = (e: React.MouseEvent) => {
    if (!thumbsRef.current) return
    thumbDragStart.current = {
      y: e.clientY,
      scrollTop: thumbsRef.current.scrollTop,
    }
    e.preventDefault()
  }
  const onThumbMouseMove = (e: React.MouseEvent) => {
    if (!thumbDragStart.current || !thumbsRef.current) return
    const dy = e.clientY - thumbDragStart.current.y
    thumbsRef.current.scrollTop = thumbDragStart.current.scrollTop - dy
  }
  const onThumbMouseLeaveOrUp = () => {
    thumbDragStart.current = null
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Image row: thumbnails + main image, items-start so main image keeps aspect-ratio height */}
      <div className="flex gap-3 items-start">
        {/* Thumbnail strip — stretches to exactly match main image height */}
        {count > 1 && (
          <div
            ref={thumbsRef}
            className={`hidden small:flex flex-col gap-2 overflow-y-auto no-scrollbar w-16 shrink-0 ${count > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
            style={mainImageHeight ? { maxHeight: mainImageHeight } : undefined}
            onMouseDown={onThumbMouseDown}
            onMouseMove={onThumbMouseMove}
            onMouseUp={onThumbMouseLeaveOrUp}
            onMouseLeave={onThumbMouseLeaveOrUp}
          >
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
                    src={img.url}
                    alt={t("Imagine produs {index}", { index: i + 1 })}
                    fill
                    className="object-contain object-center bg-white"
                    sizes="64px"
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div
          ref={mainImageRef}
          className={`relative aspect-[3/4] flex-1 overflow-hidden select-none ${count > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        >
          <AnimatePresence mode="sync">
            {selected?.url && (
              <motion.div
                key={selected.url}
                initial={isFirstRender.current ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={selected.url}
                  alt={t("Imagine produs")}
                  fill
                  priority
                  draggable={false}
                  className="object-contain object-center pointer-events-none"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setLightboxOpen(true)}
            aria-label={t("Vizualizează pe tot ecranul")}
            className="absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md text-hunter-gold transition-all duration-200 hover:scale-105"
          >
            <ExpandIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dots */}
      {count > 1 && (
        <div className="flex items-center justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              aria-label={t("Imagine {index}", { index: i + 1 })}
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

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          index={selectedIndex}
          onIndexChange={setSelectedIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}
