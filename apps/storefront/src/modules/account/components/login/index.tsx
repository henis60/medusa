import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="w-full max-w-sm flex flex-col items-center"
      data-testid="login-page"
    >
      <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-3">
        The Hunter House
      </p>
      <h1 className="font-display text-[34px] leading-[1] text-[var(--theme-text)] mb-2">
        Welcome back
      </h1>
      <p className="font-sans text-[11px] text-[var(--theme-text-muted)] mb-10 text-center">
        Sign in to access an enhanced shopping experience.
      </p>

      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-3">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton
          data-testid="sign-in-button"
          className="w-full mt-6 h-12 rounded-none !bg-hunter-gold !text-hunter-dark !border-transparent font-sans uppercase tracking-[3px] text-[11px]"
        >
          Sign in
        </SubmitButton>
      </form>

      <p className="font-sans text-[10px] text-[var(--theme-text-muted)] mt-8 text-center">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="text-[var(--theme-text)] hover:text-hunter-gold transition-colors underline underline-offset-2"
          data-testid="register-button"
        >
          Join us
        </button>
      </p>
    </div>
  )
}

export default Login
