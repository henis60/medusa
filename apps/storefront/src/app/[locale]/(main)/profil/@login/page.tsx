import LoginTemplate from "@modules/account/templates/login-template"

type Props = {
  searchParams: Promise<{ redirectTo?: string }>
}

export default async function Login({ searchParams }: Props) {
  const { redirectTo } = await searchParams
  return <LoginTemplate redirectTo={redirectTo} />
}
