"use client"

import { createContext, useContext } from "react"
import { HttpTypes } from "@medusajs/types"

type Ctx = {
  categories: HttpTypes.StoreProductCategory[]
  collections: HttpTypes.StoreCollection[]
}

// No default provider — consumers on pages that don't wrap with
// StoreCatalogProvider (category/collection templates, which pass fixed
// categoryId/collectionId props directly instead of resolving from the URL)
// simply get empty lists and fall back to their own props.
const StoreCatalogContext = createContext<Ctx | null>(null)

export const StoreCatalogProvider = StoreCatalogContext.Provider

/** Read the categories/collections lists provided by the /ready-to-wear layout. */
export function useStoreCatalog(): Ctx | null {
  return useContext(StoreCatalogContext)
}
