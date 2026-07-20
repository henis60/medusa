"use client"

import { createContext, useContext } from "react"

export type StoreFacets = {
  priceBounds: [number, number]
  colorFacets: string[]
  hasProducts: boolean
}

const DEFAULT_FACETS: StoreFacets = {
  priceBounds: [0, 0],
  colorFacets: [],
  hasProducts: true,
}

type Ctx = {
  facets: StoreFacets
  setFacets: (f: StoreFacets) => void
}

// No default provider — consumers on pages that don't wrap with
// StoreFacetsProvider (category/collection templates) simply get null and
// skip reporting, since those pages don't render a desktop filter drawer.
const StoreFacetsContext = createContext<Ctx | null>(null)

export const StoreFacetsProvider = StoreFacetsContext.Provider

/** Read the current facets (defaults to empty if no provider is present). */
export function useStoreFacets(): StoreFacets {
  const ctx = useContext(StoreFacetsContext)
  return ctx?.facets ?? DEFAULT_FACETS
}

/** Report facet data upward; a no-op if no provider is present. */
export function useSetStoreFacets(): (f: StoreFacets) => void {
  const ctx = useContext(StoreFacetsContext)
  return ctx?.setFacets ?? (() => {})
}
