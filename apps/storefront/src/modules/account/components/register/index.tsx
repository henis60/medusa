"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(
    signup as (state: string | null, formData: FormData) => Promise<string | null>,
    null as string | null
  )

  return (
    <div
      className="w-full max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-3">
        The Hunter House
      </p>
      <h1 className="font-display text-[34px] leading-[1] text-[var(--theme-text)] mb-2">
        Become a Member
      </h1>
      <p className="font-sans text-[11px] text-[var(--theme-text-muted)] mb-10 text-center">
        Create your profile and get access to an enhanced shopping experience.
      </p>

      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-3">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
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
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <p className="font-sans text-[10px] text-[var(--theme-text-muted)] mt-6 text-center leading-relaxed">
          By creating an account, you agree to our{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="text-[var(--theme-text)] hover:text-hunter-gold underline underline-offset-2 transition-colors"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="text-[var(--theme-text)] hover:text-hunter-gold underline underline-offset-2 transition-colors"
          >
            Terms of Use
          </LocalizedClientLink>
          .
        </p>
        <SubmitButton
          className="w-full mt-4 h-12 rounded-none !bg-hunter-gold !text-hunter-dark !border-transparent font-sans uppercase tracking-[3px] text-[11px]"
          data-testid="register-button"
        >
          Create Account
        </SubmitButton>
      </form>

      <p className="font-sans text-[10px] text-[var(--theme-text-muted)] mt-8 text-center">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="text-[var(--theme-text)] hover:text-hunter-gold transition-colors underline underline-offset-2"
        >
          Sign in
        </button>
      </p>
    </div>
  )
}

export default Register
