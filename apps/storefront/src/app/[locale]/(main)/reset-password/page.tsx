import { Metadata } from "next"
import { redirect } from "@i18n/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import ResetPassword from "@modules/account/components/reset-password"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "account" })
  return {
    title: t("Resetare parolă"),
    description: t("Setează o parolă nouă pentru contul tău"),
  }
}

type Props = {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    redirect({ href: "/profil", locale: await getLocale() })
    return null
  }

  return <ResetPassword token={token} />
}
