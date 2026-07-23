import { retrieveCustomer } from "@lib/data/customer"
// TODO: Re-add Toaster component when needed
import AccountLayout from "@modules/account/templates/account-layout"

// Account pages are per-user — never prerender them at build time (a
// build-time fetch to the backend here previously failed the whole build).
export const dynamic = "force-dynamic"

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    // flex column so the login template can stretch to full viewport height
    // (important on mobile, where the form otherwise floats mid-page).
    return <div className="flex-1 flex flex-col">{login}</div>
  }

  return (
    <AccountLayout customer={customer}>
      {dashboard}
    </AccountLayout>
  )
}
