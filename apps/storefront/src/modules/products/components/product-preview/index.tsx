import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import PreviewPrice from "./price"
import CardWrapper from "./card-wrapper"
import ProductCardLink from "./product-card-link"

const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a",
  white: "#f4f2ee",
  "off-white": "#ede8df",
  ivory: "#e8e2d5",
  cream: "#ddd4be",
  beige: "#c8b89a",
  sand: "#b8a688",
  grey: "#8a9198",
  gray: "#8a9198",
  "light grey": "#b8bfc5",
  "light gray": "#b8bfc5",
  "dark grey": "#474f58",
  "dark gray": "#474f58",
  charcoal: "#3a4149",
  navy: "#1e2e45",
  blue: "#4a6d8c",
  "light blue": "#7a9db8",
  "sky blue": "#6a96b0",
  "dark blue": "#1e3055",
  red: "#8c3a3a",
  burgundy: "#5e2530",
  wine: "#5e2530",
  green: "#2d4f38",
  "hunter green": "#1e3d30",
  olive: "#5e5828",
  khaki: "#8a7d52",
  brown: "#5e3a18",
  camel: "#a07d42",
  tan: "#a07840",
  cognac: "#6e3818",
  gold: "#a8883a",
  yellow: "#a89050",
  orange: "#8c4e28",
  pink: "#c4919f",
  "light pink": "#d4a8b2",
  rose: "#b06870",
  blush: "#c09090",
  purple: "#5e4070",
  lilac: "#9a8ab0",
  lavender: "#b0a8c8",
  silver: "#a8adb2",
}

function ColorSwatches({ product }: { product: HttpTypes.StoreProduct }) {
  const colorOption = product.options?.find((o) =>
    ["color", "colour", "culoare"].includes(o.title?.toLowerCase() ?? "")
  )
  if (!colorOption?.values?.length) return null

  // Find the hex stored per-variant (metadata.color_hex) for a given color value.
  const hexFromVariants = (value?: string) => {
    if (!value) return null
    const variant = product.variants?.find((v) =>
      v.options?.some(
        (o) => o.option_id === colorOption.id && o.value === value
      )
    )
    const hex = (variant?.metadata?.color_hex as string | undefined) ?? null
    return hex && /^#?[0-9a-fA-F]{3,8}$/.test(hex)
      ? hex.startsWith("#")
        ? hex
        : `#${hex}`
      : null
  }

  const colors = colorOption.values.map((v) => ({
    label: v.value,
    hex:
      hexFromVariants(v.value) ??
      COLOR_MAP[v.value?.toLowerCase()] ??
      "#c0b8b0",
  }))

  if (colors.length <= 1) return null

  return (
    <div className="flex items-center gap-1.5">
      {colors.slice(0, 6).map(({ label, hex }) => (
        <span
          key={label}
          title={label}
          className="h-2 w-3.5 border border-black/15 flex-shrink-0 sm:h-3 sm:w-5"
          style={{ backgroundColor: hex }}
        />
      ))}
      {colors.length > 6 && (
        <span className="text-[9px] text-white/60 ml-0.5">
          +{colors.length - 6}
        </span>
      )}
    </div>
  )
}

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
  forceDark,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  forceDark?: boolean
}) {
  const { cheapestPrice } = getProductPrice({ product })

  return (
    <ProductCardLink
      href={`/products/${product.handle}`}
      className="group flex flex-col relative w-full justify-between cursor-pointer"
      style={
        {
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        } as React.CSSProperties
      }
    >
      <div data-testid="product-wrapper" className="w-full">
        <CardWrapper
          product={product}
          isFeatured={isFeatured}
          forceDark={forceDark}
        />
      </div>

      {/* Card info — mobile */}
      <div
        className="mt-2.5 flex flex-col gap-0.5 sm:hidden"
        style={{ minHeight: "2.5rem" }}
      >
        <p
          className={`font-sans text-[9px] uppercase tracking-[2.5px] leading-snug line-clamp-2 transition-colors duration-300 ${
            forceDark
              ? "text-hunter-ivory/80 group-hover:text-hunter-gold"
              : "text-[var(--theme-text)] group-hover:text-hunter-gold"
          }`}
          data-testid="product-title"
        >
          {product.title}
        </p>
        <div className="flex items-center justify-between gap-2 [&_*]:!text-[10px]">
          <ColorSwatches product={product} />
          {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
        </div>
      </div>

      {/* Card info — desktop */}
      <div
        className={`mt-2.5 hidden sm:flex items-start justify-between gap-3 transition-opacity duration-300 ${
          forceDark ? "group-hover:opacity-0" : ""
        }`}
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <p
            className={`font-sans text-[11px] uppercase tracking-[2px] leading-snug truncate transition-colors duration-300 ${
              forceDark
                ? "text-hunter-ivory/80 group-hover:text-hunter-gold"
                : "text-[var(--theme-text)] group-hover:text-hunter-gold"
            }`}
            data-testid="product-title"
          >
            {product.title}
          </p>
          <ColorSwatches product={product} />
        </div>
        {cheapestPrice && (
          <div className="shrink-0">
            <PreviewPrice price={cheapestPrice} />
          </div>
        )}
      </div>
    </ProductCardLink>
  )
}
