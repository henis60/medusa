"use client"

import { isManual, isNetopia, isStripeLike } from "@lib/constants"
import { initiateNetopiaPayment, placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import ErrorMessage from "../error-message"
import { getDisplayableErrorMessage } from "@lib/util/stale-deployment"
import Spinner from "@modules/common/icons/spinner"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const t = useTranslations("checkout")
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    case isNetopia(paymentSession?.provider_id):
      return (
        <NetopiaPaymentButton
          notReady={notReady}
          cart={cart}
          providerId={paymentSession!.provider_id}
          data-testid={dataTestId}
        />
      )
    default:
      return (
        <button
          disabled
          className="w-full py-3 bg-hunter-gold text-[#0D0D0D] font-sans text-[10px] uppercase tracking-[4px] opacity-40 cursor-not-allowed"
        >
          {t("Selectează o metodă de plată")}
        </button>
      )
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const t = useTranslations("checkout")
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(getDisplayableErrorMessage(err, t("A apărut o eroare Reîncearcă")))
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            return onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          setSubmitting(false)
          return
        }

        if (
          paymentIntent &&
          (paymentIntent.status === "requires_capture" ||
            paymentIntent.status === "succeeded")
        ) {
          return onPaymentCompleted()
        }

        // Any other non-terminal status (requires_action, processing, ...)
        // never reaches onPaymentCompleted, whose .finally() is otherwise the
        // only place submitting gets reset — without this the button stays
        // disabled/spinning forever and the customer can't retry.
        setErrorMessage(t("A apărut o eroare Reîncearcă"))
        setSubmitting(false)
      })
      .catch((err) => {
        setErrorMessage(getDisplayableErrorMessage(err, t("A apărut o eroare Reîncearcă")))
        setSubmitting(false)
      })
  }

  return (
    <>
      <button
        disabled={disabled || notReady || submitting}
        onClick={handlePayment}
        data-testid={dataTestId}
        className={`relative w-full py-3 bg-hunter-gold text-[#0D0D0D] font-sans text-[10px] uppercase tracking-[4px] hover:opacity-90 transition-opacity disabled:cursor-not-allowed overflow-hidden ${
          disabled || notReady ? "opacity-40" : ""
        }`}
      >
        <span
          className={`flex items-center justify-center gap-2 transition-opacity duration-150 ${
            submitting ? "opacity-0" : "opacity-100"
          }`}
        >
          {t("Plasează comanda")}
        </span>
        {submitting && (
          <span className="absolute inset-0 flex items-center justify-center gap-2">
            <Spinner size="14" />
            {t("Se procesează…")}
          </span>
        )}
      </button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const t = useTranslations("checkout")
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(getDisplayableErrorMessage(err, t("A apărut o eroare Reîncearcă")))
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <button
        disabled={notReady || submitting}
        onClick={handlePayment}
        data-testid="submit-order-button"
        className={`relative w-full py-3 bg-hunter-gold text-[#0D0D0D] font-sans text-[10px] uppercase tracking-[4px] hover:opacity-90 transition-opacity disabled:cursor-not-allowed overflow-hidden ${
          notReady ? "opacity-40" : ""
        }`}
      >
        <span
          className={`flex items-center justify-center gap-2 transition-opacity duration-150 ${
            submitting ? "opacity-0" : "opacity-100"
          }`}
        >
          {t("Plasează comanda")}
        </span>
        {submitting && (
          <span className="absolute inset-0 flex items-center justify-center gap-2">
            <Spinner size="14" />
            {t("Se procesează…")}
          </span>
        )}
      </button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

// Fingerprint de browser recomandat de Netopia pentru scoring 3DS/fraudă.
// Colectat client-side (backend-ul Medusa nu are acces la navigator/screen).
function collectBrowserInfo(): Record<string, string> {
  if (typeof window === "undefined") return {}
  const nav = window.navigator
  const scr = window.screen
  return {
    BROWSER_USER_AGENT: nav.userAgent,
    OS: nav.platform ?? "",
    OS_VERSION: "",
    MOBILE: /Mobi|Android/i.test(nav.userAgent) ? "true" : "false",
    SCREEN_POINT: "false",
    SCREEN_PRINT: `Current Resolution: ${scr.width}x${scr.height}, Available Resolution: ${scr.availWidth}x${scr.availHeight}, Color Depth: ${scr.colorDepth}`,
    BROWSER_COLOR_DEPTH: String(scr.colorDepth),
    BROWSER_SCREEN_HEIGHT: String(scr.height),
    BROWSER_SCREEN_WIDTH: String(scr.width),
    BROWSER_PLUGINS: Array.from(nav.plugins ?? [])
      .map((p) => p.name)
      .join(", "),
    BROWSER_JAVA_ENABLED: "false",
    BROWSER_LANGUAGE: nav.language ?? "",
    BROWSER_TZ: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
    BROWSER_TZ_OFFSET: String(new Date().getTimezoneOffset() * -1),
  }
}

const NetopiaPaymentButton = ({
  cart,
  providerId,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  providerId: string
  notReady: boolean
  "data-testid"?: string
}) => {
  const t = useTranslations("checkout")
  const locale = useLocale()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const redirectUrl = await initiateNetopiaPayment(cart.id, providerId, collectBrowserInfo(), locale)
      if (!redirectUrl) {
        setErrorMessage(t("Nu am putut iniția plata Reîncearcă"))
        setSubmitting(false)
        return
      }
      // `replace` (nu `href`): checkout-ul rămâne în afara istoricului, așa că
      // butonul Back din pagina Netopia nu readuce o pagină posibil coruptă.
      window.location.replace(redirectUrl)
    } catch (err) {
      setErrorMessage(getDisplayableErrorMessage(err, t("A apărut o eroare Reîncearcă")))
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        disabled={notReady || submitting}
        onClick={handlePayment}
        data-testid={dataTestId}
        className={`relative w-full py-3 bg-hunter-gold text-[#0D0D0D] font-sans text-[10px] uppercase tracking-[4px] hover:opacity-90 transition-opacity disabled:cursor-not-allowed overflow-hidden ${
          notReady ? "opacity-40" : ""
        }`}
      >
        {/* This is the checkout's most consequential click — a plain text
            swap gave no real sense that anything was happening while the
            redirect URL request was in flight. A visible spinner reassures
            the customer the button registered, without the
            disabled:opacity-40 dimming used elsewhere (which read as
            "broken" here, not "loading"). */}
        <span
          className={`flex items-center justify-center gap-2 transition-opacity duration-150 ${
            submitting ? "opacity-0" : "opacity-100"
          }`}
        >
          {t("Plătește cu cardul")}
        </span>
        {submitting && (
          <span className="absolute inset-0 flex items-center justify-center gap-2">
            <Spinner size="14" />
            {t("Se redirecționează…")}
          </span>
        )}
      </button>
      <ErrorMessage
        error={errorMessage}
        data-testid="netopia-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
