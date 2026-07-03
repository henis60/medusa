"use client"

/**
 * Tiny client-side event bus for cart changes. Since the nav cart badge
 * hydrates client-side (static/ISR shell — no server re-render on
 * navigation), mutating components emit this event after add/update/delete
 * so the badge and drawer refetch the cart.
 */
export const CART_UPDATED_EVENT = "cart:updated"

export function emitCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT))
  }
}

export function onCartUpdated(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  window.addEventListener(CART_UPDATED_EVENT, handler)
  return () => window.removeEventListener(CART_UPDATED_EVENT, handler)
}
