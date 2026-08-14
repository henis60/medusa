"use client"

import React from "react"
import { HttpTypes } from "@medusajs/types"

type PaymentWrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

/**
 * Provider-specific context wrapper for the checkout form.
 *
 * The only provider that ever needed one was Stripe (Elements context); with
 * that integration removed, Netopia (redirect-based) and the manual provider
 * need nothing, so this is a pass-through. It is kept as the single seam where
 * a future provider's context would be mounted.
 */
const PaymentWrapper: React.FC<PaymentWrapperProps> = ({ children }) => {
  return <div>{children}</div>
}

export default PaymentWrapper
