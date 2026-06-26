"use client"

import { ArrowRightOnRectangle } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { signout } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { motion } from "framer-motion"

const NAV_ITEMS = [
  { label: "Acasă", href: "/account" },
  { label: "Detalii cont", href: "/account/detalii-cont" },
  { label: "Adrese salvate", href: "/account/addresses" },
  { label: "Comenzi", href: "/account/orders" },
  { label: "Favorite", href: "/account/favorites" },
]

const MOBILE_NAV_ITEMS = NAV_ITEMS.filter(({ href }) => href !== "/account")

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const router = useRouter()
  const [clickedHref, setClickedHref] = useState<string | null>(null)
  const [listKey, setListKey] = useState(0)
  const isOverview = route === "/account"
  const prevIsOverviewRef = useRef<boolean>(isOverview)

  useEffect(() => {
    const wasOnSubPage = !prevIsOverviewRef.current
    if (isOverview && wasOnSubPage) {
      setListKey((k) => k + 1)
    }
    prevIsOverviewRef.current = isOverview
    setClickedHref(null)
  }, [route])

  const handleNavItemClick = (href: string) => {
    if (clickedHref) return
    setClickedHref(href)
    setTimeout(() => router.push(href), 380)
  }

  const handleLogout = async () => {
    await signout()
  }

  const activeItem = MOBILE_NAV_ITEMS.find(
    ({ href }) =>
      route === href ||
      route.startsWith(href),
  )

  return (
    <div>
      {/* Mobile nav */}
      <div
        className="small:hidden overflow-hidden"
        data-testid="mobile-account-nav"
      >
        {isOverview ? (
          <ul key={listKey} className="flex flex-col">
            {MOBILE_NAV_ITEMS.map(({ label, href }, i) => {
              const isClicked = clickedHref === href
              return (
                <motion.li
                  key={href}
                  className="overflow-hidden border-b border-[var(--theme-border)]"
                  initial={listKey > 0 ? { maxHeight: 0, opacity: 0 } : false}
                  animate={{
                    maxHeight: clickedHref && !isClicked ? 0 : 64,
                    opacity: clickedHref && !isClicked ? 0 : 1,
                    borderBottomWidth: clickedHref && !isClicked ? 0 : 1,
                  }}
                  transition={{
                    duration: 0.25,
                    ease: "easeInOut",
                    delay: listKey > 0 && !clickedHref ? i * 0.06 : 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleNavItemClick(href)}
                    className="flex items-center justify-between py-3.5 w-full font-serif text-[22px] leading-[1] tracking-[0.02em] text-left"
                    data-testid={`${label.toLowerCase()}-link`}
                  >
                    <motion.span
                      animate={{
                        color: isClicked
                          ? "var(--theme-gold)"
                          : "var(--theme-text-muted)",
                      }}
                      transition={{ duration: 0.15 }}
                    >
                      {label}
                    </motion.span>
                    <motion.span
                      className="font-serif text-[20px]"
                      animate={{
                        color: isClicked
                          ? "var(--theme-gold)"
                          : "var(--theme-text-muted)",
                      }}
                      transition={{ duration: 0.15 }}
                    >
                      ›
                    </motion.span>
                  </button>
                </motion.li>
              )
            })}
          </ul>
        ) : activeItem ? (
          <div className="border-b border-[var(--theme-border)] py-3.5 flex items-center justify-between">
            <p className="font-serif text-[22px] leading-[1] tracking-[0.02em] text-hunter-gold">
              {activeItem.label}
            </p>
            {route.startsWith(`/account/orders/`) ? (
              <LocalizedClientLink
                href="/account/orders"
                className="font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
                data-testid="account-back-link"
              >
                ← Comenzi
              </LocalizedClientLink>
            ) : (
              <LocalizedClientLink
                href="/account"
                className="font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
                data-testid="account-back-link"
              >
                ← Profil
              </LocalizedClientLink>
            )}
          </div>
        ) : null}
      </div>

      {/* Desktop nav */}
      <div
        className="hidden small:flex flex-col py-8 pr-8 gap-12 border-r border-[var(--theme-border)]"
        data-testid="account-nav"
      >
        <ul className="flex flex-col">
          {NAV_ITEMS.map(({ label, href }) => (
            <li key={href}>
              <AccountNavLink
                href={href}
                route={route!}
                data-testid={`${label.toLowerCase()}-link`}
              >
                {label}
              </AccountNavLink>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={handleLogout}
          data-testid="logout-button"
          className="mt-10 w-fit font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors flex items-center gap-2"
        >
          <ArrowRightOnRectangle className="w-3.5 h-3.5" />
          Deconectare
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
  const active =
    route === href ||
    (href !== "/account" && route.startsWith(href))
  return (
    <LocalizedClientLink
      href={href}
      className={clx(
        "block py-4 pl-3 border-l-2 font-serif text-[22px] leading-[1] tracking-[0.02em] transition-colors duration-150",
        active
          ? "border-hunter-gold text-[var(--theme-gold)]"
          : "border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:border-[var(--theme-border)]",
      )}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav
