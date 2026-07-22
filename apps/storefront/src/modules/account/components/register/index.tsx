"use client"

import { startTransition, useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { useRecaptcha } from "@lib/hooks/use-recaptcha"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(
    signup as (state: string | null, formData: FormData) => Promise<string | null>,
    null as string | null
  )
  const { preload, getToken } = useRecaptcha()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const token = await getToken("register")
    if (token) {
      formData.set("recaptchaToken", token)
    }
    startTransition(() => formAction(formData))
  }

  return (
    <div
      className="w-full max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="font-display text-[42px] leading-[1] text-[var(--theme-text)] mb-2">
        Creează un Cont
      </h1>
      <p className="font-sans text-[14px] text-[var(--theme-text-muted)] mb-10 text-center">
        Creează-ți profilul și accesează o experiență de cumpărături îmbunătățită.
      </p>

      <form
        className="w-full flex flex-col"
        onSubmit={handleSubmit}
        onFocusCapture={preload}
      >
        <div className="flex flex-col w-full gap-y-3">
          <Input
            label="Prenume"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Nume"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Telefon"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Parolă"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <p className="font-sans text-[11px] text-[var(--theme-text-muted)] mt-6 leading-relaxed">
          Prin crearea unui cont, ești de acord cu{" "}
          <LocalizedClientLink
            href="/privacy-policy"
            className="text-[var(--theme-text)] hover:text-hunter-gold underline underline-offset-2 transition-colors"
          >
            Politica de Confidențialitate
          </LocalizedClientLink>{" "}
          și{" "}
          <LocalizedClientLink
            href="/terms-of-use"
            className="text-[var(--theme-text)] hover:text-hunter-gold underline underline-offset-2 transition-colors"
          >
            Termenii de Utilizare
          </LocalizedClientLink>
          .
        </p>
        <SubmitButton
          className="w-full mt-4 h-12 rounded-none !bg-hunter-gold !text-hunter-dark !border-transparent font-sans uppercase tracking-[3px] text-[13px]"
          data-testid="register-button"
        >
          Creează Cont
        </SubmitButton>

        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="w-full mt-3 h-12 font-sans uppercase tracking-[3px] text-[11px] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-hunter-gold hover:text-hunter-gold transition-colors"
          data-testid="switch-to-login-button"
        >
          Am deja un cont
        </button>

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

export default Register
