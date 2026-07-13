"use client"

import { ReactNode, createContext, useContext, useState } from "react"

type SelectedVariantContextType = {
  selectedVariantId: string | null
  setSelectedVariantId: (id: string | null) => void
}

const SelectedVariantContext = createContext<SelectedVariantContextType>({
  selectedVariantId: null,
  setSelectedVariantId: () => {},
})

/**
 * Shares the selected variant between ProductActions and VariantAwareGallery
 * (siblings under the product page's server component) without touching the
 * URL — router.replace() there used to re-suspend the Suspense boundary fed
 * by ProductActionsWrapper on every variant change, wiping ProductActions'
 * own state right after.
 */
export function SelectedVariantProvider({
  initialVariantId,
  children,
}: {
  initialVariantId?: string | null
  children: ReactNode
}) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    initialVariantId ?? null
  )

  return (
    <SelectedVariantContext.Provider
      value={{ selectedVariantId, setSelectedVariantId }}
    >
      {children}
    </SelectedVariantContext.Provider>
  )
}

export const useSelectedVariant = () =>
  useContext(SelectedVariantContext).selectedVariantId

export const useSetSelectedVariant = () =>
  useContext(SelectedVariantContext).setSelectedVariantId
