const ORDER_ID_PREFIX = "order_"

/**
 * Medusa's order id (`order_01K...`) is used as-is in the standalone
 * `/comanda/[id]` confirmation page so guests can view it without an
 * account — but showing the raw, prefixed id in the URL bar is an
 * unnecessary tell that it's a Medusa store. Strip the prefix for display;
 * `orderIdFromSlug` restores it before any lookup.
 */
export function orderIdToSlug(orderId: string): string {
  return orderId.startsWith(ORDER_ID_PREFIX)
    ? orderId.slice(ORDER_ID_PREFIX.length)
    : orderId
}

export function orderIdFromSlug(slug: string): string {
  return slug.startsWith(ORDER_ID_PREFIX) ? slug : `${ORDER_ID_PREFIX}${slug}`
}
