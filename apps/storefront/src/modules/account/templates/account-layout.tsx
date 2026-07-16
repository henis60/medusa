import React from "react"

import AccountNav from "../components/account-nav"
import AccountWelcome from "../components/account-welcome"
import AccountFaqStrip from "../components/account-faq-strip"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1 flex flex-col py-6 sm:py-10" data-testid="account-page">
      <div className="page-container flex-1 flex flex-col">
        {customer && <AccountWelcome customer={customer} />}
        <div className="flex-1 grid grid-cols-1 small:grid-cols-[220px_1fr] small:gap-10 content-start small:content-stretch">
          <div>{customer && <AccountNav />}</div>
          <div className="flex-1 min-w-0">{children}</div>
        </div>

        {/* Footer strip (hides itself on order details) */}
        <AccountFaqStrip />
      </div>
    </div>
  )
}

export default AccountLayout
