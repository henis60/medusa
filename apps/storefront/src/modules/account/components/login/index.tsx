"use client"

import { startTransition } from "react"
import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"
import Script from "next/script"

const RECAPTCHA_SITEKEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
  redirectTo?: string
}

const Login = ({ setCurrentView, redirectTo }: Props) => {
  const [message, formAction] = useActionState(login, null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (redirectTo) {
      formData.set("redirectTo", redirectTo)
    }
    try {
      await new Promise<void>((resolve) => window.grecaptcha.ready(resolve))
      const token = await window.grecaptcha.execute(RECAPTCHA_SITEKEY, { action: "login" })
      formData.set("recaptchaToken", token)
    } catch {
      // proceed without token — server will reject
    }
    startTransition(() => formAction(formData))
  }

  return (
    <div
      className="w-full max-w-sm flex flex-col items-center"
      data-testid="login-page"
    >
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITEKEY}`}
        strategy="lazyOnload"
      />

      <h1 className="font-display text-[42px] leading-[1] text-[var(--theme-text)] mb-2">
        Bine ai revenit
      </h1>
      <p className="font-sans text-[14px] text-[var(--theme-text-muted)] mb-10 text-center">
        Autentifică-te pentru o experiență de cumpărături îmbunătățită.
      </p>

      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex flex-col w-full gap-y-3">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Introdu o adresă de email validă."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Parolă"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />

        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.FORGOT_PASSWORD)}
            className="font-sans text-[13px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
          >
            Ai uitat parola?
          </button>
        </div>

        <SubmitButton
          data-testid="sign-in-button"
          className="w-full mt-4 h-12 rounded-none !bg-hunter-gold !text-hunter-dark !border-transparent font-sans uppercase tracking-[3px] text-[13px]"
        >
          Autentificare
        </SubmitButton>

        <p className="font-sans text-[11px] text-[var(--theme-text-muted)] mt-4 text-center leading-relaxed">
          Protejat de reCAPTCHA —{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-hunter-gold transition-colors">Confidențialitate</a>
          {" "}&amp;{" "}
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-hunter-gold transition-colors">Termeni</a>
        </p>
      </form>

    </div>
  )
}

export default Login
