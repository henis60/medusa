import React from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ customer, children }) => {
  return (
    <div className="flex-1 py-6 sm:py-10" data-testid="account-page">
      <div className="page-container">
        {customer && (
          <div className="mb-6 sm:mb-10">
            <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-2">
              Contul meu
            </p>
            <h1 className="font-display text-4xl small:text-5xl text-[var(--theme-text)] leading-tight">
              Welcome back,<br />
              <span className="italic text-hunter-gold">{customer.first_name}</span>
            </h1>
          </div>
        )}
        <div className="grid grid-cols-1 small:grid-cols-[220px_1fr] gap-0 border-t border-[var(--theme-border)]">
          <div className="border-b small:border-b-0 small:border-r border-[var(--theme-border)]">
            {customer && <AccountNav customer={customer} />}
          </div>
          <div className="flex-1 min-w-0">{children}</div>
        </div>

        {/* Footer strip */}
        <div className="flex flex-col small:flex-row items-start small:items-center justify-between border-t border-[var(--theme-border)] pt-10 mt-16 gap-6">
          <div>
            <p className="font-display text-[20px] leading-[1.1] text-[var(--theme-text)] mb-2">
              Ai întrebări?
            </p>
            <p className="font-sans text-[12px] text-[var(--theme-text-muted)]">
              Găsește răspunsuri pe pagina de întrebări frecvente.
            </p>
          </div>
          <LocalizedClientLink
            href="/faq"
            className="font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-current pb-0.5"
          >
            Întrebări frecvente
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
