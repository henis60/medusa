import { CreditCard } from "@medusajs/icons"
import PayPal from "@modules/common/icons/paypal"
import React from "react"

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  "pp_medusa-payments_default": {
    title: "Credit card",
    icon: <CreditCard />,
  },
  pp_paypal_paypal: {
    title: "PayPal",
    icon: <PayPal />,
  },
  pp_system_default: {
    title: "Manual Payment",
    icon: <CreditCard />,
  },
  pp_netopia_netopia: {
    title: "Card bancar (Netopia)",
    icon: <CreditCard />,
  },
  // Add more payment providers here
}

// The Stripe checkout integration is gone (medusa-config registers only
// Netopia + the built-in manual provider), but historical orders can still
// carry a Stripe/medusa-payments payment record whose `data.card_last4` the
// order confirmation renders — so the provider check survives for display
// only, never for routing a live payment.
export const isStripeLike = (providerId?: string) => {
  return (
    providerId?.startsWith("pp_stripe_") || providerId?.startsWith("pp_medusa-")
  )
}

export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}
export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}

export const isNetopia = (providerId?: string) => {
  return providerId?.startsWith("pp_netopia")
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]
