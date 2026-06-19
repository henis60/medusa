"use client"

import { ArrowRightOnRectangle } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useParams, usePathname } from "next/navigation"

import { signout } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

const NAV_ITEMS = [
  { label: "Overview", href: "/account" },
  { label: "Profile", href: "/account/profile" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Orders", href: "/account/orders" },
  { label: "Salvate", href: "/account/favorites" },
]

const MOBILE_NAV_ITEMS = NAV_ITEMS.filter(({ href }) => href !== "/account")

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  return (
    <div>
      {/* Mobile nav */}
      <div className="small:hidden" data-testid="mobile-account-nav">
        {route !== `/${countryCode}/account` ? (
          <LocalizedClientLink
            href="/account"
            className="inline-flex items-center gap-2 py-4 font-sans text-[11px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-[var(--theme-gold)] transition-colors"
            data-testid="account-main-link"
          >
            <span>←</span>
            <span>Înapoi la cont</span>
          </LocalizedClientLink>
        ) : (
          <>
            <ul>
              {MOBILE_NAV_ITEMS.map(({ label, href }) => (
                <li key={href}>
                  <LocalizedClientLink
                    href={href}
                    className="flex items-center justify-between py-4 border-b border-[var(--theme-border)] font-sans text-[11px] uppercase tracking-[2px] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
                    data-testid={`${label.toLowerCase()}-link`}
                  >
                    <span>{label}</span>
                    <ChevronDown className="transform -rotate-90 w-3 h-3" />
                  </LocalizedClientLink>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="flex items-center justify-between py-4 w-full font-sans text-[11px] uppercase tracking-[2px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
                  onClick={handleLogout}
                  data-testid="logout-button"
                >
                  <span>Log out</span>
                  <ArrowRightOnRectangle className="w-4 h-4" />
                </button>
              </li>
            </ul>
          </>
        )}
      </div>

      {/* Desktop nav */}
      <div className="hidden small:flex flex-col py-8 px-6 gap-0" data-testid="account-nav">
        <ul className="flex flex-col">
          {NAV_ITEMS.map(({ label, href }) => (
            <li key={href}>
              <AccountNavLink href={href} route={route!} data-testid={`${label.toLowerCase()}-link`}>
                {label}
              </AccountNavLink>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handleLogout}
          data-testid="logout-button"
          className="mt-8 w-fit font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors flex items-center gap-2"
        >
          <ArrowRightOnRectangle className="w-3.5 h-3.5" />
          Log out
        </button>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()

  const active = route === `/${countryCode}${href}`
  return (
    <LocalizedClientLink
      href={href}
      className={clx(
        "block py-3.5 font-sans text-[11px] uppercase tracking-[2px] transition-colors duration-150",
        active
          ? "text-[var(--theme-gold)]"
          : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
      )}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav
