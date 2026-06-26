import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Autentificare",
  description: "Intră în contul tău The Hunter House.",
}

type Props = {
  searchParams: Promise<{ redirectTo?: string }>
}

export default async function Login({ searchParams }: Props) {
  const { redirectTo } = await searchParams
  return <LoginTemplate redirectTo={redirectTo} />
}
