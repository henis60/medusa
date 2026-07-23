"use client"

import { HttpTypes } from "@medusajs/types"

/**
 * Tiny client-side event bus for cart changes. Since the nav cart badge
 * hydrates client-side (static/ISR shell — no server re-render on
 * navigation), mutating components emit this event so the badge and drawer
 * update.
 *
 * Two flavours:
 *  - emitCartUpdated(cart)  → instant: the payload is applied directly
 *    (either an optimistic local copy or the fresh cart returned by the
 *    server action — no extra round-trip).
 *  - emitCartUpdated()      → fallback: listeners refetch the cart.
 */
export const CART_UPDATED_EVENT = "cart:updated"

export type CartUpdatedDetail = {
  cart?: HttpTypes.StoreCart | null
  /** True while this is a local optimistic guess, not yet server-confirmed. */
  optimistic?: boolean
  /** What triggered the update — "add" explicitly opens the cart drawer. */
  action?: "add" | "update" | "delete"
}

export function emitCartUpdated(
  cart?: HttpTypes.StoreCart | null,
  opts: { optimistic?: boolean; action?: CartUpdatedDetail["action"] } = {}
) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<CartUpdatedDetail>(CART_UPDATED_EVENT, {
        detail: { cart, ...opts },
      })
    )
  }
}

export function onCartUpdated(
  handler: (detail: CartUpdatedDetail) => void
): () => void {
  if (typeof window === "undefined") return () => {}
  const listener = (e: Event) =>
    handler((e as CustomEvent<CartUpdatedDetail>).detail ?? {})
  window.addEventListener(CART_UPDATED_EVENT, listener)
  return () => window.removeEventListener(CART_UPDATED_EVENT, listener)
}

/**
 * Local optimistic transforms — applied instantly in the UI while the
 * server action runs. Totals are approximations (unit_price × quantity);
 * the server-confirmed cart replaces them within a moment.
 */
export function optimisticRemoveItem(
  cart: HttpTypes.StoreCart,
  lineId: string
): HttpTypes.StoreCart {
  const items = (cart.items ?? []).filter((i) => i.id !== lineId)
  return recalc({ ...cart, items })
}

export function optimisticSetQuantity(
  cart: HttpTypes.StoreCart,
  lineId: string,
  quantity: number
): HttpTypes.StoreCart {
  const items = (cart.items ?? []).map((i) =>
    i.id === lineId
      ? { ...i, quantity, total: (i.unit_price ?? 0) * quantity }
      : i
  )
  return recalc({ ...cart, items })
}

function recalc(cart: HttpTypes.StoreCart): HttpTypes.StoreCart {
  const subtotal = (cart.items ?? []).reduce(
    (acc, i) => acc + (i.unit_price ?? 0) * i.quantity,
    0
  )
  return { ...cart, subtotal }
}
