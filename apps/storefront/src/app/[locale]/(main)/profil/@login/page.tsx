import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import LoginTemplate from "@modules/account/templates/login-template"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account")
  return {
    title: t("Autentificare"),
    description: t("Intră în contul tău The Hunter House"),
  }
}

type Props = {
  searchParams: Promise<{ redirectTo?: string }>
}

export default async function Login({ searchParams }: Props) {
  const { redirectTo } = await searchParams
  return <LoginTemplate redirectTo={redirectTo} />
}
