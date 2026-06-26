"use client"

import { startTransition, useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { requestPasswordReset } from "@lib/data/customer"
import Script from "next/script"

const RECAPTCHA_SITEKEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const ForgotPassword = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(requestPasswordReset, null)

  const isSuccess = message === "success"

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await new Promise<void>((resolve) => window.grecaptcha.ready(resolve))
      const token = await window.grecaptcha.execute(RECAPTCHA_SITEKEY, {
        action: "password_reset",
      })
      formData.set("recaptchaToken", token)
    } catch {
      // proceed without token — server will reject
    }
    startTransition(() => formAction(formData))
  }

  return (
    <div className="w-full max-w-sm flex flex-col items-center">
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITEKEY}`}
        strategy="lazyOnload"
      />
      <h1 className="font-display text-[42px] leading-[1] text-[var(--theme-text)] mb-2">
        Resetare Parolă
      </h1>
      <p className="font-sans text-[14px] text-[var(--theme-text-muted)] mb-10 text-center">
        Introdu adresa de email și îți vom trimite un link pentru resetarea
        parolei.
      </p>

      {isSuccess ? (
        <div className="w-full text-center">
          <div className="border border-[var(--theme-border)] px-6 py-5 mb-8">
            <p className="font-sans text-[14px] text-[var(--theme-text)] leading-relaxed">
              Dacă adresa de email există în sistem, vei primi un link de
              resetare în câteva minute.
            </p>
          </div>
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="inline-flex items-center gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-gold)] transition-colors font-sans text-[11px] uppercase tracking-[3px]"
          >
            <span>←</span>
            <span>Înapoi la autentificare</span>
          </button>
        </div>
      ) : (
        <form className="w-full" onSubmit={handleSubmit}>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <ErrorMessage error={isSuccess ? null : message} />
          <SubmitButton className="w-full mt-6 h-12 rounded-none !bg-hunter-gold !text-hunter-dark !border-transparent font-sans uppercase tracking-[3px] text-[13px]">
            Trimite Link
          </SubmitButton>
          <p className="font-sans text-[11px] text-[var(--theme-text-muted)] mt-4 text-center leading-relaxed">
            Protejat de reCAPTCHA —{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-hunter-gold transition-colors"
            >
              Confidențialitate
            </a>{" "}
            &amp;{" "}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-hunter-gold transition-colors"
            >
              Termeni
            </a>
          </p>
        </form>
      )}
    </div>
  )
}

export default ForgotPassword
