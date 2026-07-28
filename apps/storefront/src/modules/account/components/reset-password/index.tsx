"use client"

import { useTranslations } from "next-intl"
import { useActionState } from "react"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { resetPassword } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  token: string
}

const ResetPassword = ({ token }: Props) => {
  const t = useTranslations("account")
  const resetWithToken = resetPassword.bind(null, token)
  const [message, formAction] = useActionState(resetWithToken, null)

  const isSuccess = message === "success"

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-16">
      <div className="w-full max-w-sm flex flex-col items-center">
        <h1 className="font-display text-[42px] leading-[1] text-[var(--theme-text)] mb-2">
          {t("Parolă Nouă")}
        </h1>
        <p className="font-sans text-[14px] text-[var(--theme-text-muted)] mb-10 text-center">
          {t("Alege o parolă nouă pentru contul tău")}
        </p>

        {isSuccess ? (
          <div className="w-full text-center flex flex-col items-center gap-6">
            <div className="border border-[var(--theme-border)] px-6 py-5 w-full">
              <p className="font-sans text-[14px] text-[var(--theme-text)] leading-relaxed">
                {t("Parola a fost schimbată cu succes Te poți autentifica acum")}
              </p>
            </div>
            <LocalizedClientLink
              href="/profil"
              className="font-sans text-[13px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
            >
              {t("Mergi la autentificare")}
            </LocalizedClientLink>
          </div>
        ) : (
          <form className="w-full" action={formAction}>
            <div className="flex flex-col w-full gap-y-3">
              <Input
                label={t("Parolă nouă")}
                name="password"
                type="password"
                autoComplete="new-password"
                required
              />
              <Input
                label={t("Confirmă parola")}
                name="password_confirm"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>
            <ErrorMessage error={message} />
            <SubmitButton className="w-full mt-6 h-12 rounded-none !bg-hunter-gold !text-hunter-dark !border-transparent font-sans uppercase tracking-[3px] text-[13px]">
              {t("Salvează Parola")}
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
