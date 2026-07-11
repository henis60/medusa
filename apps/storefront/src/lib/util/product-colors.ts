import { HttpTypes } from "@medusajs/types"

export const COLOR_MAP: Record<string, string> = {
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

export function getColorOption(product: HttpTypes.StoreProduct) {
  return product.options?.find((o) =>
    ["color", "colour", "culoare"].includes(o.title?.toLowerCase() ?? "")
  )
}

// Find the hex stored per-variant (metadata.color_hex) for a given color value.
export function hexFromVariants(
  product: HttpTypes.StoreProduct,
  colorOptionId: string | undefined,
  value?: string
) {
  if (!value || !colorOptionId) return null
  const variant = product.variants?.find((v) =>
    v.options?.some((o) => o.option_id === colorOptionId && o.value === value)
  )
  const hex = (variant?.metadata?.color_hex as string | undefined) ?? null
  return hex && /^#?[0-9a-fA-F]{3,8}$/.test(hex)
    ? hex.startsWith("#")
      ? hex
      : `#${hex}`
    : null
}

export function getProductColors(product: HttpTypes.StoreProduct) {
  const colorOption = getColorOption(product)
  if (!colorOption?.values?.length) return []

  return colorOption.values.map((v) => ({
    label: v.value,
    hex:
      hexFromVariants(product, colorOption.id, v.value) ??
      COLOR_MAP[v.value?.toLowerCase()] ??
      "#c0b8b0",
  }))
}
