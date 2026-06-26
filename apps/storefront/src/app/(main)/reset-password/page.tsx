import { Metadata } from "next"
import { redirect } from "next/navigation"
import ResetPassword from "@modules/account/components/reset-password"

export const metadata: Metadata = {
  title: "Resetare parolă",
  description: "Setează o parolă nouă pentru contul tău.",
}

type Props = {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    redirect("/account")
  }

  return <ResetPassword token={token} />
}
